
import { toast } from 'sonner';

export interface SecurityError {
  code: string;
  message: string;
  userMessage: string;
}

// Predefined safe error messages that don't reveal system internals
const SAFE_ERROR_MESSAGES: Record<string, string> = {
  AUTH_FAILED: 'Authentication failed. Please check your credentials.',
  RATE_LIMITED: 'Too many attempts. Please try again later.',
  VALIDATION_ERROR: 'Invalid input provided.',
  PERMISSION_DENIED: 'You do not have permission to perform this action.',
  RESOURCE_NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'An unexpected error occurred. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SESSION_EXPIRED: 'Your session has expired. Please sign in again.',
};

export function createSecurityError(code: string, originalError?: unknown): SecurityError {
  const userMessage = SAFE_ERROR_MESSAGES[code] || SAFE_ERROR_MESSAGES.SERVER_ERROR;
  
  // Log the actual error for debugging (in development)
  if (import.meta.env.DEV && originalError) {
    console.error(`Security Error [${code}]:`, originalError);
  }

  return {
    code,
    message: originalError instanceof Error ? originalError.message : 'Unknown error',
    userMessage,
  };
}

export function handleSecurityError(error: SecurityError | unknown, showToast: boolean = true): void {
  let securityError: SecurityError;

  if (error && typeof error === 'object' && 'code' in error) {
    securityError = error as SecurityError;
  } else {
    securityError = createSecurityError('SERVER_ERROR', error);
  }

  // Show safe message to user
  if (showToast) {
    toast.error(securityError.userMessage);
  }

  // Log for monitoring (without sensitive data)
  console.warn(`Security event: ${securityError.code}`);
}

// Sanitize error messages before displaying to prevent XSS
export function sanitizeErrorMessage(message: string): string {
  return message
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}
