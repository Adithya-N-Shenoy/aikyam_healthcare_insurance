export const validators = {
  // Phone number validation (India)
  phone: (phone: string): boolean => {
    const phoneRegex = /^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  },

  // Email validation
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Policy number validation (alphanumeric)
  policyNumber: (policyNumber: string): boolean => {
    const policyRegex = /^[A-Za-z0-9\-]{6,20}$/;
    return policyRegex.test(policyNumber);
  },

  // Date validation (YYYY-MM-DD)
  date: (date: string): boolean => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) return false;
    
    const d = new Date(date);
    return d instanceof Date && !isNaN(d.getTime());
  },

  // Amount validation
  amount: (amount: number): boolean => {
    return amount >= 0 && amount <= 9999999.99;
  },

  // File validation
  file: (file: File, options: {
    maxSize?: number;
    allowedTypes?: string[];
  } = {}): { valid: boolean; error?: string } => {
    const { maxSize = 50 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'] } = options;

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size must be less than ${maxSize / 1024 / 1024}MB`
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type must be one of: ${allowedTypes.join(', ')}`
      };
    }

    return { valid: true };
  },

  // Required field
  required: (value: any): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (typeof value === 'number') return true;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  }
};

export const validateForm = (data: Record<string, any>, rules: Record<string, any>) => {
  const errors: Record<string, string> = {};

  Object.keys(rules).forEach((field) => {
    const value = data[field];
    const fieldRules = rules[field];

    if (fieldRules.required && !validators.required(value)) {
      errors[field] = `${field} is required`;
    }

    if (fieldRules.phone && value && !validators.phone(value)) {
      errors[field] = 'Invalid phone number';
    }

    if (fieldRules.email && value && !validators.email(value)) {
      errors[field] = 'Invalid email address';
    }

    if (fieldRules.policyNumber && value && !validators.policyNumber(value)) {
      errors[field] = 'Invalid policy number';
    }

    if (fieldRules.date && value && !validators.date(value)) {
      errors[field] = 'Invalid date format';
    }

    if (fieldRules.amount && value !== undefined && !validators.amount(Number(value))) {
      errors[field] = 'Invalid amount';
    }

    if (fieldRules.min && value < fieldRules.min) {
      errors[field] = `Minimum value is ${fieldRules.min}`;
    }

    if (fieldRules.max && value > fieldRules.max) {
      errors[field] = `Maximum value is ${fieldRules.max}`;
    }

    if (fieldRules.pattern && value && !fieldRules.pattern.test(value)) {
      errors[field] = fieldRules.message || 'Invalid format';
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};