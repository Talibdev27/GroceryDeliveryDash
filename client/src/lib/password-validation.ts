export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
  meetsRequirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
}

const commonPasswords = [
  'password', 'Password123!', 'Admin123!', 'Customer123!', 'Rider123!', 'SuperAdmin123!',
  '12345678', 'qwerty123', 'Welcome123!', 'password123', 'admin123', 'letmein',
  '123456', 'password1', 'Password1', 'welcome', 'monkey', '1234567890'
];

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  const meetsRequirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[^A-Za-z0-9]/.test(password),
  };

  if (!meetsRequirements.minLength) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!meetsRequirements.hasUppercase) {
    errors.push('Password must include at least one uppercase letter');
  }
  if (!meetsRequirements.hasLowercase) {
    errors.push('Password must include at least one lowercase letter');
  }
  if (!meetsRequirements.hasNumber) {
    errors.push('Password must include at least one number');
  }
  if (!meetsRequirements.hasSpecialChar) {
    errors.push('Password must include at least one special character (!@#$%^&*)');
  }

  // Check against common passwords
  const passwordLower = password.toLowerCase();
  const isCommon = commonPasswords.some(common => 
    passwordLower.includes(common.toLowerCase()) || 
    passwordLower === common.toLowerCase()
  );

  if (isCommon) {
    errors.push('This password is too common. Please choose a more unique password.');
  }

  // Calculate strength
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  const requirementsMet = Object.values(meetsRequirements).filter(Boolean).length;
  
  if (requirementsMet === 5 && password.length >= 12 && !isCommon) {
    strength = 'strong';
  } else if (requirementsMet >= 4 && password.length >= 8) {
    strength = 'medium';
  } else {
    strength = 'weak';
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
    meetsRequirements,
  };
}

