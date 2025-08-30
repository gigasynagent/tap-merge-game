class TapMergeGame {
    constructor() {
        this.score = 0;
        this.coins = 0;
        this.board = [];
        this.boardSize = 12; // 3x4 or 4x3 grid
        this.elementTypes = ['🍎', '🍊', '🍇', '🍓', '🍒', '🍑'];
        this.doublePointsActive = false;
        this.lastTransactionId = null;
        this.init();
    }

    init() {
        // Load saved game data if available
        this.loadGame();
        this.createBoard();
        this.bindEvents();
        this.render();
        this.updateUI();
        
        // Track game start
        if (window.gameAnalytics) {
            window.gameAnalytics.trackGameStart();
        }
        
        // Make game globally accessible for analytics
        window.game = this;
        
        // Initialize security session
        if (window.gameSecurity) {
            this.sessionToken = window.gameSecurity.generateSecureToken();
            console.log('Secure session initialized');
        }
    }

    createBoard() {
        this.board = [];
        // Initialize with some random elements
        for (let i = 0; i < this.boardSize; i++) {
            this.board.push({
                id: i,
                type: Math.floor(Math.random() * this.elementTypes.length),
                level: 1,
                merged: false
            });
        }
    }

    bindEvents() {
        document.getElementById('gameBoard').addEventListener('click', (e) => {
            if (e.target.classList.contains('game-element')) {
                const id = parseInt(e.target.dataset.id);
                this.handleElementClick(id);
            }
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetGame();
            if (window.gameAnalytics) {
                window.gameAnalytics.trackGameReset();
            }
        });

        document.getElementById('shopBtn').addEventListener('click', () => {
            document.getElementById('shop').style.display = 'block';
        });

        document.getElementById('closeShop').addEventListener('click', () => {
            document.getElementById('shop').style.display = 'none';
        });

        document.getElementById('upgradeBtn').addEventListener('click', () => {
            this.purchaseUpgrade();
        });

        // New event listeners for monetization features
        document.getElementById('adBtn').addEventListener('click', () => {
            this.showAd();
        });

        document.getElementById('doublePointsBtn').addEventListener('click', () => {
            this.purchaseDoublePoints();
        });

        document.getElementById('buyCoinsBtn').addEventListener('click', () => {
            this.showPurchaseOptions();
        });
        
        // Crypto payment button
        document.getElementById('cryptoPaymentBtn').addEventListener('click', () => {
            this.showCryptoPaymentOptions();
        });
        
        // Export analytics button
        document.getElementById('exportAnalyticsBtn').addEventListener('click', () => {
            if (window.gameAnalytics && window.gameAnalytics.exportAnalytics) {
                window.gameAnalytics.exportAnalytics();
            }
        });
        
        // Security test button
        document.getElementById('securityTestBtn').addEventListener('click', () => {
            this.testSecurity();
        });
    }

    handleElementClick(id) {
        const element = this.board.find(el => el.id === id);
        if (!element) return;

        // Track element tap
        if (window.gameAnalytics) {
            window.gameAnalytics.trackElementTap(this.elementTypes[element.type], element.level);
        }

        // Check adjacent elements for merging
        const adjacentElements = this.getAdjacentElements(id);
        const sameTypeElements = adjacentElements.filter(el => 
            el.type === element.type && el.level === element.level && !el.merged
        );

        if (sameTypeElements.length > 0) {
            // Merge elements
            this.mergeElements(element, sameTypeElements);
            
            // Track merge
            if (window.gameAnalytics) {
                window.gameAnalytics.trackMerge(sameTypeElements.length, element.level);
            }
        } else {
            // Level up the element
            this.levelUpElement(element);
        }

        this.render();
        this.updateUI();
    }

    getAdjacentElements(id) {
        // Simplified adjacency check for a linear array
        // In a real grid, we would calculate based on row/column positions
        const adjacent = [];
        const possibleAdjacent = [id - 1, id + 1];
        
        possibleAdjacent.forEach(adjId => {
            if (adjId >= 0 && adjId < this.boardSize) {
                const element = this.board.find(el => el.id === adjId);
                if (element) adjacent.push(element);
            }
        });

        return adjacent;
    }

    mergeElements(baseElement, sameTypeElements) {
        // Remove merged elements
        sameTypeElements.forEach(el => {
            el.merged = true;
        });

        // Upgrade base element
        baseElement.level += 1;
        
        // Calculate points
        const points = this.calculateScore(baseElement.level * 10);
        this.score += points;
        this.coins += Math.floor(points / 2);

        // Replace merged elements with new ones
        setTimeout(() => {
            sameTypeElements.forEach(el => {
                const index = this.board.findIndex(item => item.id === el.id);
                if (index !== -1) {
                    this.board[index] = {
                        id: el.id,
                        type: Math.floor(Math.random() * this.elementTypes.length),
                        level: 1,
                        merged: false
                    };
                }
            });
            this.render();
        }, 300);
    }

    levelUpElement(element) {
        element.level += 1;
        const points = this.calculateScore(element.level * 5);
        this.score += points;
        this.coins += element.level * 2;
    }

    render() {
        const gameBoard = document.getElementById('gameBoard');
        gameBoard.innerHTML = '';

        this.board.forEach(element => {
            if (!element.merged) {
                const el = document.createElement('div');
                el.className = `game-element level-${element.level}`;
                el.dataset.id = element.id;
                el.textContent = this.elementTypes[element.type];
                gameBoard.appendChild(el);
            }
        });
    }

    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('coins').textContent = this.coins;
        
        // Update button states based on coin balance
        document.getElementById('upgradeBtn').disabled = this.coins < 50;
        document.getElementById('doublePointsBtn').disabled = this.coins < 100;
        
        // Track coin balance and score
        if (window.gameAnalytics) {
            window.gameAnalytics.trackCoinBalance(this.coins);
            window.gameAnalytics.trackScore(this.score);
        }
    }

    // Save game data to localStorage
    saveGame() {
        const gameData = {
            score: this.score,
            coins: this.coins,
            board: this.board,
            doublePointsActive: this.doublePointsActive,
            lastTransactionId: this.lastTransactionId
        };
        localStorage.setItem('tapMergeGame', JSON.stringify(gameData));
    }

    // Load game data from localStorage
    loadGame() {
        const savedGame = localStorage.getItem('tapMergeGame');
        if (savedGame) {
            const gameData = JSON.parse(savedGame);
            this.score = gameData.score || 0;
            this.coins = gameData.coins || 0;
            this.board = gameData.board || [];
            this.doublePointsActive = gameData.doublePointsActive || false;
            this.lastTransactionId = gameData.lastTransactionId || null;
        }
    }

    resetGame() {
        this.score = 0;
        this.coins = 0;
        this.doublePointsActive = false;
        this.lastTransactionId = null;
        this.createBoard();
        this.render();
        this.updateUI();
        this.saveGame();
    }

    purchaseUpgrade() {
        if (this.coins >= 50) {
            this.coins -= 50;
            const points = this.calculateScore(10);
            this.score += points;
            this.updateUI();
            this.saveGame();
            alert('Upgrade purchased! +' + points + ' points');
            
            // Track purchase
            if (window.gameAnalytics) {
                window.gameAnalytics.trackPurchase(50, 'upgrade');
            }
        } else {
            // Show purchase option with real money
            this.showPurchaseOptions();
        }
    }

    // Show real money purchase options
    showPurchaseOptions() {
        const options = [
            { coins: 100, price: 0.99, description: "Small Pack" },
            { coins: 500, price: 4.99, description: "Medium Pack" },
            { coins: 1000, price: 9.99, description: "Large Pack" }
        ];
        
        let message = "Purchase coins:\n";
        options.forEach((option, index) => {
            message += `${index + 1}. ${option.description}: ${option.coins} coins for $${option.price}\n`;
        });
        message += "Enter 1, 2, or 3 to select an option:";
        
        const choice = prompt(message, "1");
        if (choice) {
            const index = parseInt(choice) - 1;
            if (index >= 0 && index < options.length) {
                // Process payment using free payment system
                const selectedOption = options[index];
                
                if (window.paymentSystem) {
                    window.paymentSystem.processPayment(selectedOption.price, 'paypal', `${selectedOption.coins} coins`)
                        .then(transaction => {
                            this.coins += selectedOption.coins;
                            this.lastTransactionId = transaction.id;
                            this.updateUI();
                            this.saveGame();
                            alert(`Purchase successful! ${selectedOption.coins} coins added. Transaction ID: ${transaction.id}`);
                            
                            // Track purchase
                            if (window.gameAnalytics) {
                                window.gameAnalytics.trackPurchase(selectedOption.price, `${selectedOption.coins}_coins`);
                            }
                        })
                        .catch(error => {
                            alert("Payment failed: " + error.message);
                        });
                } else {
                    // Fallback for simulation
                    this.coins += selectedOption.coins;
                    this.updateUI();
                    this.saveGame();
                    alert(`Purchase successful! ${selectedOption.coins} coins added.`);
                    
                    // Track purchase
                    if (window.gameAnalytics) {
                        window.gameAnalytics.trackPurchase(selectedOption.price, `${selectedOption.coins}_coins`);
                    }
                }
            } else {
                alert("Invalid selection");
            }
        }
    }

    // Show cryptocurrency payment options
    showCryptoPaymentOptions() {
        const options = [
            { coins: 100, price: 0.99, description: "Small Pack" },
            { coins: 500, price: 4.99, description: "Medium Pack" },
            { coins: 1000, price: 9.99, description: "Large Pack" }
        ];
        
        let message = "Purchase coins with cryptocurrency:\n";
        options.forEach((option, index) => {
            message += `${index + 1}. ${option.description}: ${option.coins} coins for $${option.price}\n`;
        });
        message += "Enter 1, 2, or 3 to select an option:";
        
        const choice = prompt(message, "1");
        if (choice) {
            const index = parseInt(choice) - 1;
            if (index >= 0 && index < options.length) {
                const selectedOption = options[index];
                const cryptoType = prompt("Enter cryptocurrency (bitcoin, ethereum, litecoin):", "bitcoin");
                
                if (cryptoType) {
                    const walletAddress = prompt("Enter your wallet address:");
                    
                    if (walletAddress && window.paymentSystem) {
                        window.paymentSystem.processCryptoPayment(selectedOption.price, cryptoType, walletAddress)
                            .then(result => {
                                alert(`Crypto payment initiated!\n${result.message}\n\nTransaction ID: ${result.transactionId}`);
                                
                                // For simulation purposes, we'll add coins immediately
                                // In a real implementation, you would wait for blockchain confirmation
                                this.coins += selectedOption.coins;
                                this.lastTransactionId = result.transactionId;
                                this.updateUI();
                                this.saveGame();
                                
                                // Track purchase
                                if (window.gameAnalytics) {
                                    window.gameAnalytics.trackPurchase(selectedOption.price, `${selectedOption.coins}_coins_crypto`);
                                }
                            })
                            .catch(error => {
                                alert("Crypto payment failed: " + error.message);
                            });
                    } else {
                        alert("Wallet address is required for crypto payments");
                    }
                }
            } else {
                alert("Invalid selection");
            }
        }
    }

    // Show advertisement (simulated)
    showAd() {
        // In a real implementation, this would integrate with an ad network
        alert("Showing advertisement... Watch to earn 20 coins!");
        this.coins += 20;
        this.updateUI();
        this.saveGame();
        
        // Track ad watched
        if (window.gameAnalytics) {
            window.gameAnalytics.trackAdWatched();
        }
    }

    // Double points power-up
    purchaseDoublePoints() {
        if (this.coins >= 100) {
            this.coins -= 100;
            this.doublePointsActive = true;
            
            // Apply double points for next 30 seconds
            const originalCalculateScore = this.calculateScore;
            this.calculateScore = (basePoints) => basePoints * 2;
            
            this.updateUI();
            this.saveGame();
            alert('Double points activated for 30 seconds!');
            
            // Track purchase
            if (window.gameAnalytics) {
                window.gameAnalytics.trackPurchase(100, 'double_points');
            }
            
            setTimeout(() => {
                this.doublePointsActive = false;
                this.calculateScore = originalCalculateScore;
                this.updateUI();
                alert('Double points expired');
            }, 30000);
        } else {
            alert('Not enough coins! Need 100 coins for double points.');
        }
    }

    // Default score calculation
    calculateScore(basePoints) {
        return basePoints;
    }
    
    // Test security features
    testSecurity() {
        if (!window.gameSecurity || !window.paymentSystem) {
            alert('Security system not available');
            return;
        }
        
        // Create a test transaction
        const testData = {
            userId: 'user123',
            action: 'purchase_test',
            amount: 1.99,
            timestamp: new Date().toISOString()
        };
        
        // Sign the data
        const signature = window.gameSecurity.signTransaction(testData);
        
        // Verify the signature
        const verification = window.gameSecurity.verifyTransaction(signature.signedData);
        
        // Show results
        let message = "Security Test Results:\n\n";
        message += "Data signed successfully\n";
        message += "Signature: " + signature.hash.substring(0, 16) + "...\n";
        message += "Verification: " + (verification.valid ? "PASSED" : "FAILED") + "\n";
        
        if (verification.valid) {
            message += "Decoded data: " + JSON.stringify(verification.data, null, 2);
        } else {
            message += "Error: " + verification.error;
        }
        
        alert(message);
        
        // Also test base64 encoding/decoding
        const encoded = window.gameSecurity.secureBase64Encode(testData);
        const decoded = window.gameSecurity.secureBase64Decode(encoded);
        
        console.log('Security test - Original:', testData);
        console.log('Security test - Encoded:', encoded.substring(0, 50) + '...');
        console.log('Security test - Decoded:', decoded);
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TapMergeGame();
});