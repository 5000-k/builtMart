/**
 * Utility for debugging API requests and responses
 */

export const debugRequest = (url, method, data, headers) => {
  console.group(`🔍 ${method.toUpperCase()} ${url}`);
  console.log('Headers:', headers);
  console.log('Request Data:', data);
  
  // Validate common issues
  const issues = [];
  
  if (!data || typeof data !== 'object') {
    issues.push('Request data is not a valid object');
  }
  
  // Check required fields for product creation
  if (url.includes('/products') && method === 'post') {
    const requiredFields = ['name', 'description', 'category', 'price', 'stock'];
    requiredFields.forEach(field => {
      if (!data[field]) {
        issues.push(`Missing required field: ${field}`);
      }
    });
    
    // Check images structure
    if (data.images && Array.isArray(data.images)) {
      data.images.forEach((img, index) => {
        if (!img.public_id || !img.url) {
          issues.push(`Image ${index + 1} missing public_id or url`);
        }
        if (img.url && !isValidUrl(img.url)) {
          issues.push(`Image ${index + 1} has invalid URL: ${img.url}`);
        }
      });
    }
  }
  
  if (issues.length > 0) {
    console.warn('⚠️ Potential Issues:', issues);
  } else {
    console.log('✅ Request looks valid');
  }
  
  console.groupEnd();
  return issues;
};

export const debugResponse = (response, error) => {
  if (error) {
    console.group('❌ API Error Response');
    console.log('Status:', error.response?.status);
    console.log('Status Text:', error.response?.statusText);
    console.log('Headers:', error.response?.headers);
    console.log('Error Data:', error.response?.data);
    console.log('Full Error:', error);
    
    // Analyze common error patterns
    const analysis = analyzeError(error);
    console.log('🔍 Error Analysis:', analysis);
    
    console.groupEnd();
    return { error: true, analysis };
  } else {
    console.group('✅ API Success Response');
    console.log('Status:', response.status);
    console.log('Data:', response.data);
    console.groupEnd();
    return { error: false };
  }
};

export const analyzeError = (error) => {
  const status = error.response?.status;
  const data = error.response?.data;
  
  switch (status) {
    case 400:
      if (data?.errors && Array.isArray(data.errors)) {
        return {
          type: 'VALIDATION_ERROR',
          message: 'Backend validation failed',
          details: data.errors.map(err => `${err.field}: ${err.message}`),
          fix: 'Check all required fields and data formats'
        };
      }
      return {
        type: 'BAD_REQUEST',
        message: data?.message || 'Invalid request data',
        fix: 'Review request payload structure'
      };
      
    case 401:
      return {
        type: 'AUTHENTICATION_ERROR',
        message: 'User not authenticated',
        fix: 'Check login status and token'
      };
      
    case 403:
      return {
        type: 'AUTHORIZATION_ERROR',
        message: 'User lacks permissions',
        fix: 'Ensure user has admin privileges'
      };
      
    case 404:
      return {
        type: 'NOT_FOUND',
        message: 'Resource not found',
        fix: 'Check API endpoint and resource ID'
      };
      
    case 500:
      return {
        type: 'SERVER_ERROR',
        message: 'Internal server error',
        fix: 'Check server logs and try again'
      };
      
    default:
      return {
        type: 'UNKNOWN_ERROR',
        message: error.message,
        fix: 'Check network connection and API status'
      };
  }
};

export const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

export const validateProductData = (data) => {
  const issues = [];
  
  // Required fields
  const required = ['name', 'description', 'category', 'price', 'stock'];
  required.forEach(field => {
    if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
      issues.push(`${field} is required`);
    }
  });
  
  // Data types
  if (data.price && isNaN(Number(data.price))) {
    issues.push('Price must be a valid number');
  }
  
  if (data.stock && isNaN(Number(data.stock))) {
    issues.push('Stock must be a valid number');
  }
  
  if (data.comparePrice && isNaN(Number(data.comparePrice))) {
    issues.push('Compare price must be a valid number');
  }
  
  // Boolean fields
  if (data.isFeatured !== undefined && typeof data.isFeatured !== 'boolean') {
    issues.push('isFeatured must be a boolean');
  }
  
  if (data.isActive !== undefined && typeof data.isActive !== 'boolean') {
    issues.push('isActive must be a boolean');
  }
  
  // Arrays
  if (data.specifications && !Array.isArray(data.specifications)) {
    issues.push('specifications must be an array');
  }
  
  if (data.images && !Array.isArray(data.images)) {
    issues.push('images must be an array');
  }
  
  // Image validation
  if (data.images && Array.isArray(data.images)) {
    data.images.forEach((img, index) => {
      if (!img.public_id || !img.url) {
        issues.push(`Image ${index + 1} must have both public_id and url`);
      }
      if (img.url && !isValidUrl(img.url)) {
        issues.push(`Image ${index + 1} has invalid URL`);
      }
    });
  }
  
  return issues;
};
