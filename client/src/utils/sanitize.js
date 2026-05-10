import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param {string} dirty - The potentially unsafe HTML string
 * @param {Object} options - DOMPurify configuration options
 * @returns {string} - The sanitized HTML string
 */
export const sanitizeHTML = (dirty, options = {}) => {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }

  const defaultOptions = {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'i', 'b', 
      'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'code', 'pre'
    ],
    ALLOWED_ATTR: ['class'],
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM_IMPORT: false,
    SANITIZE_DOM: true,
    SANITIZE_DOM_FRAGMENT: true,
    SANITIZE_NAMED_PROPS: true,
    WHOLE_DOCUMENT: false,
    CUSTOM_ELEMENT_HANDLING: {
      tagNameCheck: null,
      attributeNameCheck: null,
      allowCustomizedBuiltInElements: false,
    },
    ...options
  };

  return DOMPurify.sanitize(dirty, defaultOptions);
};

/**
 * Sanitize plain text content (removes all HTML)
 * @param {string} dirty - The potentially unsafe string
 * @returns {string} - The sanitized plain text
 */
export const sanitizeText = (dirty) => {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }
  
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  });
};

/**
 * Sanitize user input for display in text-only contexts
 * @param {string} dirty - The potentially unsafe string
 * @param {number} maxLength - Maximum allowed length
 * @returns {string} - The sanitized and truncated string
 */
export const sanitizeUserInput = (dirty, maxLength = 1000) => {
  const sanitized = sanitizeText(dirty);
  return sanitized.length > maxLength ? sanitized.substring(0, maxLength) : sanitized;
};

/**
 * Sanitize and truncate text for display in limited spaces
 * @param {string} dirty - The potentially unsafe string
 * @param {number} maxLength - Maximum allowed length
 * @returns {string} - The sanitized and truncated string with ellipsis if needed
 */
export const sanitizeAndTruncate = (dirty, maxLength = 100) => {
  const sanitized = sanitizeText(dirty);
  if (sanitized.length <= maxLength) {
    return sanitized;
  }
  return sanitized.substring(0, maxLength - 3) + '...';
};
