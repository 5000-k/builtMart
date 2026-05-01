/**
 * Centralized API Error Handler
 * Provides consistent error handling across the application
 */

export class APIError extends Error {
  constructor(message, statusCode = 500, code = null, field = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.field = field;
    this.name = 'APIError';
  }
}

export const handleAPIError = (error) => {
  console.group('🔥 API Error Analysis');
  
  // Network errors
  if (!error.response) {
    console.error('Network Error:', error.message);
    return new APIError('Network connection failed. Please check your internet connection.', 0, 'NETWORK');
  }
  
  const { status, data } = error.response;
  
  // Handle different status codes
  switch (status) {
    case 400:
      console.error('Bad Request:', data);
      if (data?.errors && Array.isArray(data.errors)) {
        const validationErrors = data.errors.map(err => `${err.field || 'Field'}: ${err.message}`);
        return new APIError(`Validation failed: ${validationErrors.join(', ')}`, 400, 'VALIDATION');
      }
      return new APIError(data?.message || 'Invalid request data', 400, 'BAD_REQUEST');
      
    case 401:
      console.error('Unauthorized:', data);
      return new APIError('Authentication required. Please log in again.', 401, 'AUTH');
      
    case 403:
      console.error('Forbidden:', data);
      return new APIError('Access denied. You don\'t have permission for this action.', 403, 'PERMISSION');
      
    case 404:
      console.error('Not Found:', data);
      return new APIError('Resource not found.', 404, 'NOT_FOUND');
      
    case 429:
      console.error('Rate Limited:', data);
      return new APIError('Too many requests. Please try again later.', 429, 'RATE_LIMIT');
      
    case 500:
      console.error('Server Error:', data);
      return new APIError('Server error. Please try again later.', 500, 'SERVER');
      
    default:
      console.error('Unknown Error:', { status, data });
      return new APIError(data?.message || `Request failed with status ${status}`, status, 'UNKNOWN');
  }
};

export const getErrorMessage = (error) => {
  if (error instanceof APIError) {
    return error.message;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
};

export const isRetryableError = (error) => {
  if (!error?.statusCode) return false;
  
  const retryableCodes = [408, 429, 500, 502, 503, 504];
  return retryableCodes.includes(error.statusCode);
};

export default {
  APIError,
  handleAPIError,
  getErrorMessage,
  isRetryableError,
};
