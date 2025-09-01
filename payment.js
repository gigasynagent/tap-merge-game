// Free payment simulation system with security features
// This simulates payments without requiring real payment processing

class FreePaymentSystem {
    constructor() {
        this.paymentMethods = [
            { id: 'paypal', name: 'PayPal', fee: 0.029 }, // 2.9% fee
            { id: 'stripe', name: 'Stripe', fee: 0.029 },  // 2.9% fee
            { id: 'crypto', name: 'Cryptocurrency', fee: 0.01 } // 1% fee
        ];
        this.transactions = [];
        this.init();
    }

    init() {
        // Load previous transactions from localStorage
        this.loadTransactions();
        console.log('Free Payment System initialized');
    }

    // Simulate payment processing with security
    processPayment(amount, method, description) {
        return new Promise((resolve, reject) => {
            // Simulate network delay
            setTimeout(() => {
                try {
                    // Validate amount
                    if (amount <= 0) {
                        throw new Error('Invalid amount');
                    }

                    // Validate payment method
                    const paymentMethod = this.paymentMethods.find(m => m.id === method);
                    if (!paymentMethod) {
                        throw new Error('Invalid payment method');
                    }

                    // Calculate fees
                    const fee = amount * paymentMethod.fee;
                    const netAmount = amount - fee;

                    // Create transaction record
                    const transactionData = {
                        id: this.generateTransactionId(),
                        amount: amount,
                        fee: fee,
                        netAmount: netAmount,
                        method: method,
                        description: description,
                        timestamp: new Date().toISOString(),
                        status: 'completed'
                    };

                    // Sign transaction with security system if available
                    let signedTransaction = transactionData;
                    let transactionSignature = null;
                    
                    if (window.gameSecurity) {
                        const signature = window.gameSecurity.signTransaction(transactionData);
                        signedTransaction = signature.signedData;
                        transactionSignature = signature.hash;
                        
                        console.log('Transaction signed with hash:', transactionSignature);
                    }

                    // Store transaction
                    const transactionRecord = {
                        id: transactionData.id,
                        amount: amount,
                        fee: fee,
                        netAmount: netAmount,
                        method: method,
                        description: description,
                        timestamp: new Date().toISOString(),
                        status: 'completed',
                        signedData: signedTransaction,
                        signature: transactionSignature
                    };
                    
                    this.transactions.push(transactionRecord);
                    this.saveTransactions();

                    console.log(`Payment processed: $${amount} via ${paymentMethod.name}`);
                    console.log(`Fees: $${fee.toFixed(2)}, Net: $${netAmount.toFixed(2)}`);

                    resolve(transactionRecord);
                } catch (error) {
                    console.error('Payment processing error:', error);
                    reject(error);
                }
            }, 1000); // Simulate 1 second processing time
        });
    }

    // Simulate cryptocurrency payment using base64 encoding for transaction data with enhanced security
    processCryptoPayment(amount, cryptoType, walletAddress) {
        return new Promise((resolve, reject) => {
            // Simulate network delay
            setTimeout(() => {
                try {
                    // Validate amount
                    if (amount <= 0) {
                        throw new Error('Invalid amount');
                    }

                    // Validate crypto type
                    const validCryptos = ['bitcoin', 'ethereum', 'litecoin'];
                    if (!validCryptos.includes(cryptoType)) {
                        throw new Error('Invalid cryptocurrency type');
                    }

                    // Calculate equivalent crypto amount (simplified)
                    const cryptoRates = {
                        bitcoin: 50000,    // $50,000 per BTC
                        ethereum: 3000,    // $3,000 per ETH
                        litecoin: 150      // $150 per LTC
                    };

                    const cryptoAmount = amount / cryptoRates[cryptoType];
                    
                    // Create transaction data
                    const transactionData = {
                        amount: amount,
                        cryptoAmount: cryptoAmount,
                        cryptoType: cryptoType,
                        walletAddress: walletAddress,
                        timestamp: new Date().toISOString()
                    };
                    
                    // Encode transaction data in base64 with security
                    let encodedData = btoa(JSON.stringify(transactionData));
                    
                    // Apply additional security with our security system
                    if (window.gameSecurity) {
                        encodedData = window.gameSecurity.secureBase64Encode(transactionData);
                        console.log('Securely encoded transaction data');
                    }
                    
                    // Create transaction record
                    const transaction = {
                        id: this.generateTransactionId(),
                        amount: amount,
                        cryptoAmount: cryptoAmount,
                        cryptoType: cryptoType,
                        walletAddress: walletAddress,
                        encodedData: encodedData,
                        timestamp: new Date().toISOString(),
                        status: 'pending'
                    };

                    // Store transaction
                    this.transactions.push(transaction);
                    this.saveTransactions();

                    console.log(`Crypto payment initiated: $${amount} (${cryptoAmount.toFixed(6)} ${cryptoType.toUpperCase()})`);
                    console.log(`Encoded transaction data: ${encodedData.substring(0, 50)}...`);

                    resolve({
                        transactionId: transaction.id,
                        amount: amount,
                        cryptoAmount: cryptoAmount,
                        cryptoType: cryptoType,
                        encodedData: encodedData,
                        message: `Send ${cryptoAmount.toFixed(6)} ${cryptoType.toUpperCase()} to wallet address: ${walletAddress}`
                    });
                } catch (error) {
                    console.error('Crypto payment processing error:', error);
                    reject(error);
                }
            }, 1500); // Simulate 1.5 second processing time
        });
    }

    // Verify a transaction using security features
    verifyTransaction(transactionId) {
        const transaction = this.transactions.find(t => t.id === transactionId);
        if (!transaction) {
            return { valid: false, error: 'Transaction not found' };
        }
        
        // If we have a signature, verify it
        if (transaction.signature && window.gameSecurity) {
            const verification = window.gameSecurity.verifyTransaction(transaction.signedData);
            return verification;
        }
        
        // Basic verification
        return {
            valid: true,
            data: {
                id: transaction.id,
                amount: transaction.amount,
                method: transaction.method,
                timestamp: transaction.timestamp,
                status: transaction.status
            }
        };
    }

    // Decode transaction data
    decodeTransactionData(encodedData) {
        try {
            // Try our secure decoder first
            if (window.gameSecurity) {
                const decoded = window.gameSecurity.secureBase64Decode(encodedData);
                if (decoded) {
                    return decoded;
                }
            }
            
            // Fallback to standard base64 decode
            const jsonString = atob(encodedData);
            return JSON.parse(jsonString);
        } catch (e) {
            console.error('Failed to decode transaction data:', e);
            return null;
        }
    }

    generateTransactionId() {
        return 'txn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    loadTransactions() {
        try {
            const data = localStorage.getItem('payment_transactions');
            if (data) {
                this.transactions = JSON.parse(data);
            }
        } catch (e) {
            console.log('Error loading transactions:', e);
            this.transactions = [];
        }
    }

    saveTransactions() {
        try {
            localStorage.setItem('payment_transactions', JSON.stringify(this.transactions));
        } catch (e) {
            console.log('Error saving transactions:', e);
        }
    }

    getTransactionHistory() {
        return this.transactions.slice().reverse(); // Return most recent first
    }

    // Calculate total revenue
    getTotalRevenue() {
        return this.transactions
            .filter(t => t.status === 'completed')
            .reduce((sum, t) => sum + (t.netAmount || t.amount), 0);
    }

    // Calculate fees paid
    getTotalFees() {
        return this.transactions
            .filter(t => t.status === 'completed')
            .reduce((sum, t) => sum + (t.fee || 0), 0);
    }
}

// Initialize payment system
const paymentSystem = new FreePaymentSystem();

// Make payment system globally accessible
window.paymentSystem = paymentSystem;

// Export for use in other modules
// export default paymentSystem;