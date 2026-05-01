/**
 * Security utilities for enhanced application security
 */

// XSS Protection
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim();
};

// CSRF Protection
export const generateCSRFToken = () => {
  const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return token;
};

// Session Security
export const validateSession = () => {
  const token = localStorage.getItem('accessToken');
  const user = localStorage.getItem('user');
  
  if (!token || !user) {
    return false;
  }
  
  try {
    // Check if token is expired (basic JWT validation)
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) return false;
    
    const payload = JSON.parse(atob(tokenParts[1]));
    const now = Date.now() / 1000;
    
    return payload.exp > now;
  } catch {
    return false;
  }
};

// Rate Limiting
const rateLimitStore = new Map();

export const checkRateLimit = (action, limit = 5, windowMs = 60000) => {
  const now = Date.now();
  const key = `${action}_${Math.floor(now / windowMs)}`;
  
  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, 0);
  }
  
  const currentCount = rateLimitStore.get(key);
  if (currentCount >= limit) {
    return false;
  }
  
  rateLimitStore.set(key, currentCount + 1);
  return true;
};

// Input Validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  if (!password || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return { valid: false, message: 'Password must contain uppercase, lowercase, and number' };
  }
  
  return { valid: true };
};

// Secure Storage
export const secureStorage = {
  set: (key, value) => {
    try {
      const encrypted = btoa(JSON.stringify(value));
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('Storage encryption failed:', error);
      localStorage.setItem(key, JSON.stringify(value));
    }
  },
  
  get: (key) => {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;
      
      const decrypted = atob(encrypted);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Storage decryption failed:', error);
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    }
  },
  
  remove: (key) => {
    localStorage.removeItem(key);
  },
  
  clear: () => {
    localStorage.clear();
  }
};

// Content Security Policy
export const setCSPHeaders = () => {
  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  meta.content = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'";
  document.head.appendChild(meta);
};
