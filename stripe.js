// Stripe payment integration with secure transaction handling

class StripePaymentSystem {
    constructor() {
        // Initialize Stripe - Replace with your publishable key
        // Get this from your Stripe Dashboard after creating an account
        this.publishableKey = 'pk_test_51HG6RrI6dplRcBsQKwbESRfY8xJrEtMPSK9c9Jy0WE5qTWKk9Z5KlP8jZw4C8Ja5TlLR9NXOLlBnl2Sg2WJVADkr00G9V5Ntlg';
        this.stripe = Stripe(this.publishableKey);
        this.products = [
            { id: 'price_100coins', name: '100 Coins', price: 0.99, coins: 100 },
            { id: 'price_500coins', name: '500 Coins', price: 4.99, coins: 500 },
            { id: 'price_1000coins', name: '1000 Coins', price: 9.99, coins: 1000 }
        ];
        
        // Backend API URL - Update this to your Render backend URL
        this.backendUrl = 'http://localhost:3000'; // Change this to your Render URL in production
        
        // Integrate with security system
        this.securityEnabled = typeof window.gameSecurity !== 'undefined';
    }
    
    /**
     * Initialize Stripe payment
     * @param {Object} product - Product to purchase
     * @returns {Promise} - Resolves with session ID
     */
    async createCheckoutSession(product, productIndex) {
        try {
            // Create transaction data with metadata
            const transactionData = {
                product_id: product.id,
                product_name: product.name,
                amount: product.price,
                currency: 'usd',
                coins: product.coins,
                timestamp: new Date().toISOString(),
                customer_id: 'user_' + Math.random().toString(36).substring(2, 15)
            };
            
            // Sign transaction data if security system is available
            let signedTransaction = null;
            if (this.securityEnabled) {
                signedTransaction = window.gameSecurity.signTransaction(transactionData);
                console.log('Transaction signed with secure hash:', signedTransaction.hash);
            }
            
            // Send request to backend to create Stripe session
            const response = await fetch(`${this.backendUrl}/api/create-checkout-session`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productIndex: productIndex,
                    transactionData: {
                        ...transactionData,
                        signedTransaction: signedTransaction
                    }
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create checkout session');
            }
            
            const data = await response.json();
            
            // Store transaction in local storage for demo
            const sessionData = {
                id: data.sessionId,
                transactionData: transactionData,
                signedTransaction: signedTransaction
            };
            
            this.storeTransaction(sessionData);
            
            return sessionData;
        } catch (error) {
            console.error('Error creating checkout session:', error);
            throw error;
        }
    }
    
    /**
     * Redirect to Stripe Checkout
     * @param {string} sessionId - Stripe Checkout session ID
     */
    async redirectToCheckout(sessionId) {
        try {
            // Redirect to Stripe Checkout
            const result = await this.stripe.redirectToCheckout({
                sessionId: sessionId
            });
            
            if (result.error) {
                throw new Error(result.error.message);
            }
        } catch (error) {
            console.error('Error redirecting to checkout:', error);
            throw error;
        }
    }
    
    /**
     * Handle successful payment
     * @param {string} sessionId - Stripe Checkout session ID
     */
    async handleSuccessfulPayment(sessionId) {
        try {
            // Verify payment with backend
            const response = await fetch(`${this.backendUrl}/api/verify-payment/${sessionId}`);
            
            if (!response.ok) {
                throw new Error('Failed to verify payment');
            }
            
            const verification = await response.json();
            
            if (verification.payment_status !== 'paid') {
                throw new Error('Payment not completed');
            }
            
            // Retrieve transaction from storage
            const transactions = JSON.parse(localStorage.getItem('stripe_transactions') || '[]');
            const transaction = transactions.find(t => t.id === sessionId);
            
            if (!transaction) {
                throw new Error('Transaction not found');
            }
            
            // Use the integrated payment system if available
            if (window.paymentSystem && window.paymentSystem.processStripePayment) {
                window.paymentSystem.processStripePayment(
                    sessionId,
                    transaction.transactionData.amount,
                    transaction.transactionData.coins
                ).then(result => {
                    console.log('Payment processed with integrated system:', result);
                }).catch(error => {
                    console.error('Error processing with integrated system:', error);
                });
            }
            
            // Update game state
            if (window.game) {
                window.game.coins += parseInt(verification.coins);
                window.game.lastTransactionId = sessionId;
                window.game.updateUI();
                window.game.saveGame();
            }
            
            // Track purchase in analytics
            if (window.gameAnalytics) {
                window.gameAnalytics.trackPurchase(
                    transaction.transactionData.amount,
                    `stripe_${transaction.transactionData.coins}_coins`
                );
            }
            
            // Show success message
            alert(`Payment successful! ${verification.coins} coins added to your account.`);
            
            // Verify transaction integrity if security system is available
            if (this.securityEnabled && transaction.signedTransaction) {
                const verificationResult = window.gameSecurity.verifyTransaction(transaction.signedTransaction.signedData);
                console.log('Transaction verification:', verificationResult);
                
                if (!verificationResult.valid) {
                    console.error('Transaction integrity check failed:', verificationResult.error);
                    alert('Warning: Transaction integrity verification failed. Please contact support.');
                }
            }
        } catch (error) {
            console.error('Error handling successful payment:', error);
            alert('Error processing payment: ' + error.message);
        }
    }
    
    /**
     * Store transaction in local storage for demo purposes
     * @param {Object} transaction - Transaction data
     */
    storeTransaction(transaction) {
        try {
            const transactions = JSON.parse(localStorage.getItem('stripe_transactions') || '[]');
            transactions.push(transaction);
            localStorage.setItem('stripe_transactions', JSON.stringify(transactions));
        } catch (error) {
            console.error('Error storing transaction:', error);
        }
    }
    
    /**
     * Process payment with selected product
     * @param {number} index - Product index
     */
    async processPayment(index) {
        try {
            // Get selected product
            const product = this.products[index];
            if (!product) {
                throw new Error('Invalid product');
            }
            
            // Show loading message
            alert('Redirecting to secure payment page...');
            
            // Create checkout session with backend
            const session = await this.createCheckoutSession(product, index);
            
            // Redirect to checkout
            await this.redirectToCheckout(session.id);
        } catch (error) {
            console.error('Error processing payment:', error);
            alert('Payment error: ' + error.message);
        }
    }
    
    /**
     * Get all stored transactions
     * @returns {Array} - Array of transactions
     */
    getTransactions() {
        try {
            return JSON.parse(localStorage.getItem('stripe_transactions') || '[]');
        } catch (error) {
            console.error('Error getting transactions:', error);
            return [];
        }
    }
    
    /**
     * Verify transaction with Stripe
     * @param {string} sessionId - Stripe Checkout session ID
     * @returns {Promise} - Resolves with verification result
     */
    async verifyTransaction(sessionId) {
        try {
            // In a real implementation, you would call your server to verify the transaction
            // For demo purposes, we'll simulate the verification
            
            // Retrieve transaction from storage
            const transactions = this.getTransactions();
            const transaction = transactions.find(t => t.id === sessionId);
            
            if (!transaction) {
                return { valid: false, error: 'Transaction not found' };
            }
            
            // Verify transaction integrity if security system is available
            if (this.securityEnabled && transaction.signedTransaction) {
                return window.gameSecurity.verifyTransaction(transaction.signedTransaction.signedData);
            }
            
            return { valid: true, data: transaction.transactionData };
        } catch (error) {
            console.error('Error verifying transaction:', error);
            return { valid: false, error: error.message };
        }
    }
}

// Initialize Stripe payment system
const stripePaymentSystem = new StripePaymentSystem();

// Make it globally accessible
window.stripePaymentSystem = stripePaymentSystem;