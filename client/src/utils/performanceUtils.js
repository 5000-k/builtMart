/**
 * Performance optimization utilities
 */

// Debounce utility
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle utility
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Lazy loading for images
export const lazyLoadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

// Intersection Observer for lazy loading
export const createIntersectionObserver = (callback, options = {}) => {
  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  };
  
  return new IntersectionObserver(callback, defaultOptions);
};

// Memory management
export const cleanup = () => {
  // Clear unused event listeners
  if (typeof window !== 'undefined') {
    // Clear any pending timeouts
    const highestTimeoutId = setTimeout(() => {}, 0);
    for (let i = 0; i < highestTimeoutId; i++) {
      clearTimeout(i);
    }
    
    // Clear any pending animation frames
    const highestAnimationId = requestAnimationFrame(() => {});
    for (let i = 0; i < highestAnimationId; i++) {
      cancelAnimationFrame(i);
    }
  }
};

// Bundle splitting helper
export const loadComponent = async (componentPath) => {
  try {
    const module = await import(componentPath);
    return module.default;
  } catch (error) {
    console.error(`Failed to load component ${componentPath}:`, error);
    throw error;
  }
};

// Cache management
const cache = new Map();

export const getCachedData = (key, fetcher, ttl = 300000) => { // 5 minutes default
  const cached = cache.get(key);
  const now = Date.now();
  
  if (cached && (now - cached.timestamp) < ttl) {
    return cached.data;
  }
  
  try {
    const data = await fetcher();
    cache.set(key, { data, timestamp: now });
    return data;
  } catch (error) {
    console.error(`Cache miss for ${key}:`, error);
    throw error;
  }
};

// Performance monitoring
export const measurePerformance = (name, fn) => {
  return async (...args) => {
    const start = performance.now();
    try {
      const result = await fn(...args);
      const end = performance.now();
      console.log(`⚡ ${name}: ${(end - start).toFixed(2)}ms`);
      return result;
    } catch (error) {
      const end = performance.now();
      console.error(`❌ ${name}: Failed after ${(end - start).toFixed(2)}ms`, error);
      throw error;
    }
  };
};

// Virtual scrolling optimization
export const createVirtualScroll = (items, itemHeight, containerHeight) => {
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const totalHeight = items.length * itemHeight;
  
  return {
    visibleItems: items.slice(0, visibleCount + 1), // +1 for buffer
    totalHeight,
    visibleCount,
    scrollTop: 0,
    itemHeight
  };
};

// Image optimization
export const optimizeImage = (file, maxWidth = 800, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob(resolve, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};
