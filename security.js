// Security utilities for game protection
class GameSecurity {
    constructor() {
        this.encryptionKey = this.generateKey();
        this.transactionSalt = this.generateSalt();
        console.log('Game Security System Initialized');
    }

    // Generate a random encryption key
    generateKey() {
        try {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let key = '';
            for (let i = 0; i < 32; i++) {
                key += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return key;
        } catch (e) {
            console.error('Error generating key:', e);
            return 'fallbackSecurityKey12345678901234567890';
        }
    }

    // Generate a random salt
    generateSalt() {
        try {
            return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        } catch (e) {
            console.error('Error generating salt:', e);
            return 'fallbackSalt123456789';
        }
    }

    // Simple XOR encryption (for demonstration)
    xorEncrypt(text, key) {
        try {
            let result = '';
            for (let i = 0; i < text.length; i++) {
                result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
            }
            return result;
        } catch (e) {
            console.error('Encryption error:', e);
            return text; // Return original text if encryption fails
        }
    }

    // Base64 encode with additional security layer
    secureBase64Encode(data) {
        try {
            // Convert to JSON string if it's an object
            const jsonString = typeof data === 'object' ? JSON.stringify(data) : String(data);
            
            // Apply XOR encryption
            const encrypted = this.xorEncrypt(jsonString, this.encryptionKey);
            
            // Add salt
            const salted = this.transactionSalt + encrypted + this.transactionSalt;
            
            // Encode with base64
            return btoa(unescape(encodeURIComponent(salted))); // Handle UTF-8 characters
        } catch (e) {
            console.error('Base64 encoding error:', e);
            // Fallback to simpler encoding
            try {
                return btoa(typeof data === 'object' ? JSON.stringify(data) : String(data));
            } catch (e2) {
                console.error('Fallback encoding error:', e2);
                return 'encodingError';
            }
        }
    }

    // Base64 decode with security verification
    secureBase64Decode(encodedData) {
        try {
            // Decode from base64
            const salted = decodeURIComponent(escape(atob(encodedData))); // Handle UTF-8 characters
            
            // Remove salt
            const encrypted = salted.substring(this.transactionSalt.length, salted.length - this.transactionSalt.length);
            
            // Apply XOR decryption
            const decrypted = this.xorEncrypt(encrypted, this.encryptionKey);
            
            // Parse JSON if possible
            try {
                return JSON.parse(decrypted);
            } catch (e) {
                return decrypted;
            }
        } catch (e) {
            console.error('Decryption failed:', e);
            // Try a simpler decoding approach as fallback
            try {
                const decoded = atob(encodedData);
                try {
                    return JSON.parse(decoded);
                } catch (e2) {
                    return decoded;
                }
            } catch (e2) {
                console.error('Fallback decoding failed:', e2);
                return null;
            }
        }
    }

    // Create a secure hash for data integrity
    createHash(data) {
        // Simple hash function for demonstration
        let hash = 0;
        const str = typeof data === 'object' ? JSON.stringify(data) : data;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(16);
    }

    // Verify data integrity
    verifyHash(data, hash) {
        return this.createHash(data) === hash;
    }

    // Secure transaction signing
    signTransaction(transactionData) {
        // Add timestamp
        transactionData.timestamp = new Date().toISOString();
        
        // Create hash for integrity
        const hash = this.createHash(transactionData);
        
        // Encode with base64 for secure transmission
        const encoded = this.secureBase64Encode({
            data: transactionData,
            hash: hash
        });
        
        return {
            signedData: encoded,
            hash: hash
        };
    }

    // Verify signed transaction
    verifyTransaction(signedData) {
        try {
            // Decode the signed data
            const decoded = this.secureBase64Decode(signedData);
            
            if (!decoded || !decoded.data || !decoded.hash) {
                return { valid: false, error: 'Invalid transaction format' };
            }
            
            // Verify hash
            const isValid = this.verifyHash(decoded.data, decoded.hash);
            
            return {
                valid: isValid,
                data: decoded.data,
                error: isValid ? null : 'Data integrity check failed'
            };
        } catch (e) {
            return { valid: false, error: 'Transaction verification failed: ' + e.message };
        }
    }

    // Generate secure token for session management
    generateSecureToken() {
        const data = {
            sessionId: this.generateSalt(),
            timestamp: Date.now(),
            random: Math.random()
        };
        
        return this.secureBase64Encode(data);
    }

    // Validate secure token
    validateToken(token) {
        try {
            const decoded = this.secureBase64Decode(token);
            const now = Date.now();
            
            // Check if token is not expired (1 hour)
            if (now - decoded.timestamp > 3600000) {
                return { valid: false, error: 'Token expired' };
            }
            
            return { valid: true, data: decoded };
        } catch (e) {
            return { valid: false, error: 'Token validation failed' };
        }
    }
}

// Initialize security system
const gameSecurity = new GameSecurity();

// Make it globally accessible
window.gameSecurity = gameSecurity;

// Export for use in other modules
// export default gameSecurity;// Security update Sun, Aug 31, 2025 12:31:48 AM
// Security update Sun, Aug 31, 2025 12:44:05 AM
