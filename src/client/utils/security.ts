import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'mono-games-default-key-change-me';

/**
 * Security Utilities for Mono Games
 * Provides encryption, hashing, and validation functions
 */

// ==================== Encryption ====================

/**
 * Encrypt data using AES-256
 */
export const encrypt = (data: any): string | null => {
  try {
    const jsonString = JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(jsonString, ENCRYPTION_KEY).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    return null;
  }
};

/**
 * Decrypt AES-256 encrypted data
 */
export const decrypt = (encryptedData: string): any => {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

// ==================== Hashing ====================

/**
 * Generate SHA-256 hash
 */
export const hash = (data: any): string => {
  const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
  return CryptoJS.SHA256(jsonString).toString();
};

/**
 * Verify hash integrity
 */
export const verifyHash = (data, expectedHash) => {
  const dataHash = hash(data);
  return dataHash === expectedHash;
};

// ==================== File Integrity ====================

/**
 * Calculate file checksum
 */
export const calculateChecksum = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const wordArray = CryptoJS.lib.WordArray.create(event.target.result);
      const checksum = CryptoJS.SHA256(wordArray).toString();
      resolve(checksum);
    };
    
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Verify file integrity
 */
export const verifyFileIntegrity = async (file, expectedChecksum) => {
  const actualChecksum = await calculateChecksum(file);
  return actualChecksum === expectedChecksum;
};

// ==================== Input Validation ====================

/**
 * Sanitize HTML to prevent XSS
 */
export const sanitizeHTML = (html) => {
  const temp = document.createElement('div');
  temp.textContent = html;
  return temp.innerHTML;
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate username (alphanumeric, 3-20 chars)
 */
export const isValidUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): { isValid: boolean; strength: string; score: number } => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return {
    isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers,
    length: password.length >= minLength,
    hasUpperCase,
    hasLowerCase,
    hasNumbers,
    hasSpecialChar,
    strength: calculatePasswordStrength(password)
  };
};

const calculatePasswordStrength = (password) => {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
  
  if (strength <= 2) return 'weak';
  if (strength <= 4) return 'medium';
  return 'strong';
};

// ==================== Secure Storage ====================

/**
 * Store encrypted data in localStorage
 */
export const secureStore = (key, data) => {
  try {
    const encrypted = encrypt(data);
    localStorage.setItem(key, encrypted);
    return true;
  } catch (error) {
    console.error('Secure store error:', error);
    return false;
  }
};

/**
 * Retrieve and decrypt data from localStorage
 */
export const secureRetrieve = (key) => {
  try {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;
    return decrypt(encrypted);
  } catch (error) {
    console.error('Secure retrieve error:', error);
    return null;
  }
};

/**
 * Remove data from secure storage
 */
export const secureRemove = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Secure remove error:', error);
    return false;
  }
};

// ==================== Anti-Cheat ====================

/**
 * Generate timestamp signature for score submission
 */
export const generateScoreSignature = (userId, gameId, score, timestamp) => {
  const data = `${userId}-${gameId}-${score}-${timestamp}`;
  return hash(data);
};

/**
 * Verify score signature
 */
export const verifyScoreSignature = (userId, gameId, score, timestamp, signature) => {
  const expectedSignature = generateScoreSignature(userId, gameId, score, timestamp);
  return expectedSignature === signature;
};

/**
 * Generate anti-cheat token
 */
export const generateAntiCheatToken = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  const data = `${timestamp}-${random}`;
  return {
    token: hash(data),
    timestamp
  };
};

/**
 * Validate timing (detect impossible scores/times)
 */
export const validateTiming = (startTime, endTime, minDuration = 1000) => {
  const duration = endTime - startTime;
  return duration >= minDuration && duration < 86400000; // Max 24 hours
};

// ==================== Request Signing ====================

/**
 * Sign API request
 */
export const signRequest = (method, url, body = null) => {
  const timestamp = Date.now();
  const nonce = Math.random().toString(36).substring(2);
  const data = `${method}:${url}:${timestamp}:${nonce}${body ? ':' + JSON.stringify(body) : ''}`;
  
  return {
    signature: hash(data),
    timestamp,
    nonce
  };
};

/**
 * Generate CSRF token
 */
export const generateCSRFToken = () => {
  const token = CryptoJS.lib.WordArray.random(32).toString();
  sessionStorage.setItem('csrf_token', token);
  return token;
};

/**
 * Verify CSRF token
 */
export const verifyCSRFToken = (token) => {
  const storedToken = sessionStorage.getItem('csrf_token');
  return token === storedToken;
};

// ==================== Rate Limiting (Client-Side) ====================

const requestLog = new Map();

/**
 * Check if request is rate limited
 */
export const isRateLimited = (endpoint, maxRequests = 10, windowMs = 60000) => {
  const now = Date.now();
  const key = endpoint;
  
  if (!requestLog.has(key)) {
    requestLog.set(key, []);
  }
  
  const requests = requestLog.get(key);
  
  // Remove old requests outside the window
  const validRequests = requests.filter(timestamp => now - timestamp < windowMs);
  
  if (validRequests.length >= maxRequests) {
    return true;
  }
  
  validRequests.push(now);
  requestLog.set(key, validRequests);
  
  return false;
};

// ==================== Code Obfuscation Helpers ====================

/**
 * Obfuscate function names (for debugging detection)
 */
export const isDebuggerActive = () => {
  const start = performance.now();
  debugger;
  const end = performance.now();
  return end - start > 100;
};

/**
 * Detect DevTools
 */
export const detectDevTools = () => {
  const threshold = 160;
  const widthThreshold = window.outerWidth - window.innerWidth > threshold;
  const heightThreshold = window.outerHeight - window.innerHeight > threshold;
  return widthThreshold || heightThreshold;
};

// ==================== Export All ====================

export default {
  encrypt,
  decrypt,
  hash,
  verifyHash,
  calculateChecksum,
  verifyFileIntegrity,
  sanitizeHTML,
  isValidEmail,
  isValidUsername,
  validatePassword,
  secureStore,
  secureRetrieve,
  secureRemove,
  generateScoreSignature,
  verifyScoreSignature,
  generateAntiCheatToken,
  validateTiming,
  signRequest,
  generateCSRFToken,
  verifyCSRFToken,
  isRateLimited,
  isDebuggerActive,
  detectDevTools
};
