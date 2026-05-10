// Global error handler utility

/**
 * Log error to console and optionally send to error reporting service
 * @param {Error} error - The error object
 * @param {Object} context - Additional context information
 */
export const logError = (error, context = {}) => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    context,
    userAgent: navigator.userAgent,
    url: window.location.href,
  };

  // Log to console in development
  if (import.meta.env.DEV) {
    console.error('Global Error Handler:', errorInfo);
  }

  // In production, you would send this to an error reporting service
  // such as Sentry, LogRocket, or a custom endpoint
  // sendErrorToService(errorInfo);
};

/**
 * Handle unhandled promise rejections
 */
export const setupUnhandledRejectionHandler = () => {
  window.addEventListener('unhandledrejection', (event) => {
    logError(new Error(event.reason), { type: 'unhandledRejection' });
    
    // Prevent the default browser behavior
    event.preventDefault();
  });
};

/**
 * Handle uncaught errors
 */
export const setupUncaughtErrorHandler = () => {
  window.addEventListener('error', (event) => {
    logError(event.error || new Error(event.message), { 
      type: 'uncaughtError',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });
};

/**
 * Initialize global error handlers
 */
export const initializeErrorHandlers = () => {
  setupUnhandledRejectionHandler();
  setupUncaughtErrorHandler();
};

/**
 * Create a user-friendly error message
 * @param {Error} error - The error object
 * @returns {string} - User-friendly error message
 */
export const getUserFriendlyErrorMessage = (error) => {
  if (!error) return 'An unexpected error occurred.';

  // Network errors
  if (error.code === 'NETWORK_ERROR' || error.message.includes('fetch')) {
    return 'Network connection error. Please check your internet connection.';
  }

  // Authentication errors
  if (error.response?.status === 401) {
    return 'Your session has expired. Please log in again.';
  }

  // Authorization errors
  if (error.response?.status === 403) {
    return 'You do not have permission to perform this action.';
  }

  // Not found errors
  if (error.response?.status === 404) {
    return 'The requested resource was not found.';
  }

  // Server errors
  if (error.response?.status >= 500) {
    return 'Server error. Please try again later.';
  }

  // CSRF errors
  if (error.response?.data?.code === 'EBADCSRFTOKEN') {
    return 'Security validation failed. Please refresh the page.';
  }

  // Default to the error message if available
  return error.message || 'An unexpected error occurred.';
};

/**
 * Show error notification to user
 * @param {Error} error - The error object
 * @param {Function} setError - Function to set error state
 */
export const handleError = (error, setError) => {
  const userMessage = getUserFriendlyErrorMessage(error);
  logError(error, { userMessage });
  
  if (setError && typeof setError === 'function') {
    setError(userMessage);
  }
};
