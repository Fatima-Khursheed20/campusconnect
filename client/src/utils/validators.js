// src/utils/validators.js

export const validateEmail = (email) => {
  if (!email) {
    return 'Email is required.';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address.';
  }
  return null;
};

export const validatePassword = (password) => {
  if (!password) {
    return 'Password is required.';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters long.';
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return 'Password must contain at least one uppercase letter.';
  }
  if (!/(?=.*\d)/.test(password)) {
    return 'Password must contain at least one number.';
  }
  if (!/(?=.*[!@#$%^&*])/.test(password)) {
    return 'Password must contain at least one special character (!@#$%^&*).';
  }
  return null;
};

export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} is required.`;
  }
  return null;
};

export const validatePasswordMatch = (password, confirmPassword) => {
  if (password !== confirmPassword) {
    return 'Passwords do not match.';
  }
  return null;
};

export const validateMinLength = (value, min, fieldName) => {
  if (!value || value.length < min) {
    return `${fieldName} must be at least ${min} characters long.`;
  }
  return null;
};

export const validateFutureDate = (dateString) => {
  if (!dateString) {
    return 'Date is required.';
  }
  const selectedDate = new Date(dateString);
  const today = new Date();
  // Reset time part to compare dates only
  today.setHours(0, 0, 0, 0);
  if (selectedDate < today) {
    return 'The date cannot be in the past.';
  }
  return null;
};
