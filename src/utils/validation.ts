
import { z } from 'zod';

// Email validation schema
export const emailSchema = z.string()
  .email('Invalid email format')
  .min(1, 'Email is required')
  .max(254, 'Email is too long')
  .refine(
    (email) => !email.includes('..'),
    'Email cannot contain consecutive dots'
  );

// Password validation schema
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character');

// Name validation schema
export const nameSchema = z.string()
  .min(1, 'Name is required')
  .max(50, 'Name is too long')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

// Generic text validation to prevent XSS
export const sanitizedTextSchema = z.string()
  .max(1000, 'Text is too long')
  .transform((text) => {
    // Remove potential script tags and dangerous content
    return text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  });

// Child name validation
export const childNameSchema = z.string()
  .min(1, 'Child name is required')
  .max(50, 'Child name is too long')
  .regex(/^[a-zA-Z\s'-]+$/, 'Child name can only contain letters, spaces, hyphens, and apostrophes');

// Log content validation
export const logContentSchema = z.object({
  text: z.string().max(5000, 'Log entry is too long').optional(),
  summary: z.string().max(1000, 'Summary is too long').optional(),
});

// Rate limiting helper
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const userAttempts = this.attempts.get(identifier);

    if (!userAttempts || now > userAttempts.resetTime) {
      this.attempts.set(identifier, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (userAttempts.count >= this.maxAttempts) {
      return false;
    }

    userAttempts.count++;
    return true;
  }

  getRemainingTime(identifier: string): number {
    const userAttempts = this.attempts.get(identifier);
    if (!userAttempts) return 0;
    return Math.max(0, userAttempts.resetTime - Date.now());
  }
}

// Create rate limiter instances
export const authRateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes
export const apiRateLimiter = new RateLimiter(100, 60 * 1000); // 100 requests per minute
