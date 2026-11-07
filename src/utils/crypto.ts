import CryptoJS from 'crypto-js';

const DEFAULT_SECRET_KEY = '123456';

/**
 * Encrypts data into AES-256 cipher string using CryptoJS
 */
export function encryptData(data: any, key: string = DEFAULT_SECRET_KEY): string {
  try {
    const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
    return CryptoJS.AES.encrypt(jsonString, key).toString();
  } catch (err) {
    console.error('AES-256 Encryption error:', err);
    return '';
  }
}

/**
 * Decrypts AES-256 cipher string back to original object or string
 */
export function decryptData<T = any>(encryptedString: string, key: string = DEFAULT_SECRET_KEY): T | null {
  try {
    if (!encryptedString || typeof encryptedString !== 'string') return null;
    const bytes = CryptoJS.AES.decrypt(encryptedString, key);
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedText) return null;
    try {
      return JSON.parse(decryptedText);
    } catch {
      return decryptedText as unknown as T;
    }
  } catch (err) {
    console.error('AES-256 Decryption error:', err);
    return null;
  }
}
