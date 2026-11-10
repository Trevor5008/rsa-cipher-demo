import axios from 'axios';
import type {
  DecryptResponse,
  EncryptResponse,
  GeneratePrimesResponse,
  SubmitKeysResponse,
  ValidatePrimeResponse,
} from '../types/rsa';

/**
 * API service for RSA operations
 * Centralizes all backend communication
 */
class RSAService {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * Generate prime numbers for RSA key generation
   */
  async generatePrimes(
    publicExp: string,
    pBits: string,
    qBits: string
  ): Promise<GeneratePrimesResponse> {
    try {
      const response = await axios.get<GeneratePrimesResponse>(
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
  async submitKeys(p: string, q: string, publicExp: string): Promise<SubmitKeysResponse> {
    try {
      const response = await axios.post<SubmitKeysResponse>(
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
  async encryptMessage(text: string, publicExp: string, mod: string): Promise<EncryptResponse> {
    try {
      const response = await axios.post<EncryptResponse>(
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
  async decryptMessage(text: string, privateExp: string, mod: string): Promise<DecryptResponse> {
    try {
      const response = await axios.post<DecryptResponse>(
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
  async validatePrime(value: string): Promise<ValidatePrimeResponse> {
    try {
      const response = await axios.post<ValidatePrimeResponse>(
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
const createRSAService = (baseURL: string) => new RSAService(baseURL);

export type { RSAService };
export default createRSAService;
