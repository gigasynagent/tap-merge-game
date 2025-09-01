/**
 * Security utility functions for the backend
 * Implements secure encoding/decoding, transaction signing and verification
 */

// Utility for secure encoding/decoding
class SecurityUtils {
  /**
   * Generate a random secure token
   * @returns {string} Secure token
   */
  static generateSecureToken() {
    return 'tok_' + Date.now().toString() + '_' + Math.random().toString(36).substring(2, 15);
  }

  /**
   * Securely encode data with base64 and additional encryption layer
   * @param {Object} data - Data to encode
   * @returns {string} Encoded data
   */
  static secureEncode(data) {
    try {
      // Convert data to JSON string
      const jsonString = JSON.stringify(data);
      
      // Apply basic encryption (in a real app, use a proper encryption library)
      const encrypted = this.simpleEncrypt(jsonString);
      
      // Convert to base64
      return Buffer.from(encrypted).toString('base64');
    } catch (error) {
      console.error('Error encoding data:', error);
      return null;
    }
  }

  /**
   * Decode securely encoded data
   * @param {string} encodedData - Encoded data
   * @returns {Object|null} Decoded data or null if invalid
   */
  static secureDecode(encodedData) {
    try {
      // Decode from base64
      const decoded = Buffer.from(encodedData, 'base64').toString();
      
      // Decrypt
      const decrypted = this.simpleDecrypt(decoded);
      
      // Parse JSON
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Error decoding data:', error);
      return null;
    }
  }

  /**
   * Sign transaction data for integrity verification
   * @param {Object} data - Transaction data
   * @returns {Object} Signed data with hash
   */
  static signTransaction(data) {
    try {
      // Add timestamp and transaction ID if not present
      const dataToSign = {
        ...data,
        timestamp: data.timestamp || new Date().toISOString(),
        transaction_id: data.transaction_id || this.generateSecureToken()
      };
      
      // Generate hash
      const hash = this.generateHash(dataToSign);
      
      // Return signed data
      return {
        signedData: dataToSign,
        hash: hash
      };
    } catch (error) {
      console.error('Error signing transaction:', error);
      return null;
    }
  }

  /**
   * Verify signed transaction data
   * @param {Object} signedData - Signed data
   * @param {string} hash - Hash to verify against
   * @returns {Object} Verification result
   */
  static verifyTransaction(signedData, hash) {
    try {
      // Generate hash from the data
      const calculatedHash = this.generateHash(signedData);
      
      // Verify hash matches
      const isValid = calculatedHash === hash;
      
      return {
        valid: isValid,
        data: signedData,
        error: isValid ? null : 'Hash verification failed'
      };
    } catch (error) {
      console.error('Error verifying transaction:', error);
      return {
        valid: false,
        error: error.message
      };
    }
  }

  /**
   * Generate hash from data for integrity verification
   * @param {Object} data - Data to hash
   * @returns {string} Hash
   */
  static generateHash(data) {
    try {
      // Convert data to string
      const dataString = JSON.stringify(data);
      
      // In a real implementation, use a proper hashing algorithm (crypto module)
      // For now, we'll use a simple implementation
      let hash = 0;
      for (let i = 0; i < dataString.length; i++) {
        const char = dataString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      
      // Convert to hexadecimal string
      return Math.abs(hash).toString(16);
    } catch (error) {
      console.error('Error generating hash:', error);
      return null;
    }
  }

  /**
   * Simple encryption for demonstration (NOT for production use)
   * @param {string} text - Text to encrypt
   * @returns {string} Encrypted text
   */
  static simpleEncrypt(text) {
    // Simple XOR encryption with a fixed key (for demonstration only)
    const key = 'SECURE_KEY_123';
    let result = '';
    
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }
    
    return result;
  }

  /**
   * Simple decryption for demonstration (NOT for production use)
   * @param {string} encrypted - Encrypted text
   * @returns {string} Decrypted text
   */
  static simpleDecrypt(encrypted) {
    // XOR encryption is symmetric, so we can use the same function
    return this.simpleEncrypt(encrypted);
  }
}

module.exports = SecurityUtils;