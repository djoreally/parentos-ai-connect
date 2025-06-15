
import DOMPurify from 'dompurify';

// Configure DOMPurify with strict security settings
DOMPurify.setConfig({
  ALLOWED_TAGS: ['b', 'i', 'u', 'em', 'strong', 'p', 'br'],
  ALLOWED_ATTR: [], // Disallow all attributes for maximum security
  ALLOW_DATA_ATTR: false,
  ALLOW_UNKNOWN_PROTOCOLS: false,
  ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  SAFE_FOR_TEMPLATES: true,
  WHOLE_DOCUMENT: false,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_TRUSTED_TYPE: false,
  FORCE_BODY: false,
  SANITIZE_DOM: true,
  KEEP_CONTENT: false,
  IN_PLACE: false,
  USE_PROFILES: {
    html: false,
    svg: false,
    svgFilters: false,
    mathMl: false,
  },
});

// Add hooks for additional security
DOMPurify.addHook('beforeSanitizeElements', function (node) {
  // Remove any script-like content
  if (node.tagName && /script|iframe|object|embed|link|meta|base/i.test(node.tagName)) {
    node.remove();
  }
});

DOMPurify.addHook('beforeSanitizeAttributes', function (node) {
  // Remove any event handler attributes
  if (node.hasAttributes && node.hasAttributes()) {
    const attributes = Array.from(node.attributes);
    attributes.forEach(attr => {
      if (attr.name.startsWith('on') || attr.name.includes('script')) {
        node.removeAttribute(attr.name);
      }
    });
  }
});

/**
 * Sanitizes a string to remove any potentially malicious HTML.
 * Uses DOMPurify with strict security configuration.
 */
export const sanitize = (dirty: string): string => {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }

  // Pre-sanitization checks
  if (containsObviousThreats(dirty)) {
    console.warn('Potential security threat detected in input');
    return '';
  }

  try {
    const clean = DOMPurify.sanitize(dirty, {
      // Additional runtime config for extra security
      FORBID_ATTR: ['style', 'class', 'id'],
      FORBID_TAGS: ['style', 'script', 'iframe', 'object', 'embed'],
    });

    // Post-sanitization validation
    if (stillContainsThreats(clean)) {
      console.warn('Sanitization may have failed, returning empty string');
      return '';
    }

    return clean;
  } catch (error) {
    console.error('Error during sanitization:', error);
    return '';
  }
};

/**
 * Sanitizes text for display in forms and inputs
 */
export const sanitizeText = (text: string): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/\n/g, '<br>')
    .trim();
};

/**
 * Validates that a string doesn't contain obvious security threats
 */
function containsObviousThreats(input: string): boolean {
  const threats = [
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /javascript:/gi,
    /data:text\/html/gi,
    /vbscript:/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /on\w+\s*=/gi,
    /expression\s*\(/gi,
    /url\s*\(/gi,
  ];

  return threats.some(threat => threat.test(input));
}

/**
 * Final validation to ensure sanitization was effective
 */
function stillContainsThreats(cleaned: string): boolean {
  const postSanitizationThreats = [
    /<script/gi,
    /javascript:/gi,
    /on\w+=/gi,
  ];

  return postSanitizationThreats.some(threat => threat.test(cleaned));
}

/**
 * Sanitizes JSON data recursively
 */
export const sanitizeObject = (data: any): any => {
  if (typeof data === 'string') {
    return sanitize(data);
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeObject);
  }
  
  if (data && typeof data === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      // Sanitize both key and value
      const cleanKey = sanitizeText(key);
      sanitized[cleanKey] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  return data;
};
