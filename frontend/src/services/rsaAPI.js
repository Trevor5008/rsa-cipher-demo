import axios from 'axios';

/**
 * API service for RSA operations
 * Centralizes all backend communication
 */
class RSAService {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  /**
   * Generate prime numbers for RSA key generation
   */
  async generatePrimes(publicExp, pBits, qBits) {
    try {
      const response = await axios.get(
        `${this.baseURL}/generate-primes/${publicExp}/${pBits}/${qBits}`
      );
      return response.data;
    } catch (error) {
      console.error('Error generating primes:', error);
      throw error;
    }
  }

  /**
   * Submit keys for processing and get calculated values
   */
  async submitKeys(p, q, publicExp) {
    try {
      const response = await axios.post(
        `${this.baseURL}/submit-keys`,
        { p, q, publicExp },
        { headers: { "Content-Type": "application/json" } }
      );
      return response.data;
    } catch (error) {
      console.error('Error submitting keys:', error);
      throw error;
    }
  }

  /**
   * Encrypt a message
   */
  async encryptMessage(text, publicExp, mod) {
    try {
      const response = await axios.post(
        `${this.baseURL}/encrypt`,
        { text, publicExp, mod },
        { headers: { "Content-Type": "application/json" } }
      );
      return response.data;
    } catch (error) {
      console.error('Error encrypting message:', error);
      throw error;
    }
  }

  /**
   * Decrypt a message
   */
  async decryptMessage(text, privateExp, mod) {
    try {
      const response = await axios.post(
        `${this.baseURL}/decrypt`,
        { text, privateExp, mod },
        { headers: { "Content-Type": "application/json" } }
      );
      return response.data;
    } catch (error) {
      console.error('Error decrypting message:', error);
      throw error;
    }
  }

  /**
   * Validate if a number is prime
   */
  async validatePrime(value) {
    try {
      const response = await axios.post(
        `${this.baseURL}/validate-prime`,
        { val: value },
        { headers: { "Content-Type": "application/json" } }
      );
      return response.data;
    } catch (error) {
      console.error('Error validating prime:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const createRSAService = (baseURL) => new RSAService(baseURL);

export default createRSAService;
