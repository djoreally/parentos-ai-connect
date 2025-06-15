
import DOMPurify from 'dompurify';

// Configure DOMPurify to allow a limited set of safe HTML tags for basic formatting.
// This prevents XSS attacks while allowing users to use bold, italics, etc.
DOMPurify.setConfig({
  ALLOWED_TAGS: ['b', 'i', 'u', 'em', 'strong', 'p', 'br'],
  ALLOWED_ATTR: [], // Disallow all attributes for maximum security
});

/**
 * Sanitizes a string to remove any potentially malicious HTML.
 * @param dirty The string to sanitize.
 * @returns The sanitized string.
 */
export const sanitize = (dirty: string): string => {
  return DOMPurify.sanitize(dirty);
};
