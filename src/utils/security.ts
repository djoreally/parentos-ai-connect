
// Security configuration and utilities
export const SECURITY_CONFIG = {
  // Content Security Policy
  CSP_DIRECTIVES: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'https:'],
    'font-src': ["'self'"],
    'connect-src': ["'self'", 'https://*.supabase.co'],
    'frame-src': ["'none'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
  },

  // Rate limiting configuration
  RATE_LIMITS: {
    AUTH: { requests: 5, windowMs: 15 * 60 * 1000 }, // 5 requests per 15 minutes
    API: { requests: 100, windowMs: 60 * 1000 }, // 100 requests per minute
    PASSWORD_RESET: { requests: 3, windowMs: 60 * 60 * 1000 }, // 3 requests per hour
  },

  // Session configuration
  SESSION: {
    TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
    REFRESH_THRESHOLD: 5 * 60 * 1000, // Refresh if expires in 5 minutes
    MAX_AGE: 7 * 24 * 60 * 60 * 1000, // 7 days maximum
  },

  // Input validation
  VALIDATION: {
    MAX_TEXT_LENGTH: 5000,
    MAX_NAME_LENGTH: 50,
    MAX_EMAIL_LENGTH: 254,
    MAX_PASSWORD_LENGTH: 128,
    ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  },
};

// Generate CSP header value
export function generateCSPHeader(): string {
  return Object.entries(SECURITY_CONFIG.CSP_DIRECTIVES)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ');
}

// Secure random string generation
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Secure comparison to prevent timing attacks
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}

// Input validation utilities
export function validateFileType(file: File): boolean {
  return SECURITY_CONFIG.VALIDATION.ALLOWED_FILE_TYPES.includes(file.type);
}

export function validateFileSize(file: File): boolean {
  return file.size <= SECURITY_CONFIG.VALIDATION.MAX_FILE_SIZE;
}

// Check if running in secure context
export function isSecureContext(): boolean {
  return window.isSecureContext || location.protocol === 'https:' || location.hostname === 'localhost';
}

// CSRF protection
export function getCSRFToken(): string {
  let token = sessionStorage.getItem('csrf-token');
  if (!token) {
    token = generateSecureToken();
    sessionStorage.setItem('csrf-token', token);
  }
  return token;
}

// Environment-based security checks
export function isProductionEnvironment(): boolean {
  return import.meta.env.PROD;
}

export function shouldEnforceHTTPS(): boolean {
  return isProductionEnvironment() && !isSecureContext();
}

// Security headers validation
export function validateSecurityHeaders(): void {
  if (isProductionEnvironment()) {
    // Check for required security headers in production
    const requiredHeaders = [
      'strict-transport-security',
      'x-content-type-options',
      'x-frame-options',
      'x-xss-protection',
    ];

    // This would typically be checked server-side
    console.info('Security headers should be configured server-side:', requiredHeaders);
  }
}

// Initialize security measures
export function initializeSecurity(): void {
  // Check secure context
  if (shouldEnforceHTTPS()) {
    console.error('Application must be served over HTTPS in production');
  }

  // Initialize CSRF token
  getCSRFToken();

  // Validate security configuration
  validateSecurityHeaders();

  // Set up CSP if not handled server-side
  if (!isProductionEnvironment()) {
    console.info('CSP should be configured server-side:', generateCSPHeader());
  }
}
