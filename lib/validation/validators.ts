/**
 * Form validation utilities
 */

export const validators = {
  email: (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  minLength: (value: string, min: number): boolean => {
    return value.length >= min;
  },

  maxLength: (value: string, max: number): boolean => {
    return value.length <= max;
  },

  required: (value: string | null | undefined): boolean => {
    return !!value && value.trim().length > 0;
  },

  password: (value: string): {
    valid: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
    minLength: boolean;
  } => {
    const result = {
      valid: true,
      hasUppercase: /[A-Z]/.test(value),
      hasLowercase: /[a-z]/.test(value),
      hasNumber: /[0-9]/.test(value),
      hasSpecial: /[!@#$%^&*]/.test(value),
      minLength: value.length >= 8,
    };
    result.valid =
      result.hasLowercase &&
      result.hasNumber &&
      result.minLength;
    return result;
  },

  match: (value: string, other: string): boolean => {
    return value === other;
  },

  phone: (value: string): boolean => {
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    return phoneRegex.test(value);
  },
};

export const validationMessages = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  minLength: (min: number) => `Must be at least ${min} characters`,
  maxLength: (max: number) => `Must not exceed ${max} characters`,
  passwordWeak: 'Password must include uppercase, lowercase, and number (min 8 chars)',
  passwordMismatch: 'Passwords do not match',
  phone: 'Please enter a valid phone number',
};
