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
    .replace(/'/g, '&#39;')
    .replace(/\//g, '&#x2F;');
}

// API Error Handler with retry logic
export class ApiErrorHandler {
  static async handleApiError<T>(
    apiCall: () => Promise<T>,
    maxRetries: number = 3,
    context: Record<string, any> = {}
  ): Promise<T> {
    let lastError: unknown;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await apiCall();
      } catch (error: unknown) {
        lastError = error;
        
        // Don't retry auth errors or client errors (4xx)
        if (error instanceof Error) {
          if (error.message.includes('JWT') || 
              error.message.includes('auth') || 
              error.message.includes('401') || 
              error.message.includes('403')) {
            console.warn('Authentication error, not retrying:', error.message);
            throw error;
          }
        }
        
        // If we've reached max retries, throw the error
        if (attempt === maxRetries) {
          console.error(`Failed after ${maxRetries} attempts:`, error);
          throw error;
        }
        
        // Exponential backoff
        const delay = Math.min(1000 * 2 ** attempt, 10000);
        console.warn(`API call failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms`, error);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // This should never happen due to the throw in the loop
    throw lastError;
  }
}

// Type for error context
export interface ErrorContext {
  userId?: string;
  action?: string;
  component?: string;
  [key: string]: any;
}

// Setup global error handlers
export function setupGlobalErrorHandling() {
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    // Show a user-friendly error message
    toast.error('An unexpected error occurred. Please try again.');
    
    // Prevent default browser handling
    event.preventDefault();
  });
  
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    
    // Show a user-friendly error message
    toast.error('An unexpected error occurred. Please refresh the page.');
    
    // Prevent default browser handling in some cases
    if (event.error && event.error.message && 
        (event.error.message.includes('network') || 
         event.error.message.includes('fetch'))) {
      event.preventDefault();
    }
  });
  
  console.log('Global error handlers initialized');
}