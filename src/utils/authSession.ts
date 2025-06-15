
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { authRateLimiter } from './validation';
import { createSecurityError, handleSecurityError } from './errorHandler';

export const signOutUser = async (): Promise<string | null> => {
  try {
    // Clear any sensitive data from localStorage
    localStorage.removeItem('supabase.auth.token');
    sessionStorage.clear();

    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      const securityError = createSecurityError('AUTH_FAILED', error);
      handleSecurityError(securityError);
      return securityError.userMessage;
    } else {
      toast.success('Signed out successfully');
      return null;
    }
  } catch (error: any) {
    console.error('Unexpected error during sign out:', error);
    const securityError = createSecurityError('SERVER_ERROR', error);
    handleSecurityError(securityError);
    return securityError.userMessage;
  }
};

export const getInitialSession = async () => {
  try {
    // Check rate limiting for session requests
    const clientId = getClientIdentifier();
    if (!authRateLimiter.isAllowed(`session-${clientId}`)) {
      const error = createSecurityError('RATE_LIMITED');
      return { session: null, error: error.userMessage };
    }

    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error);
      const securityError = createSecurityError('AUTH_FAILED', error);
      return { session: null, error: securityError.userMessage };
    }

    // Validate session integrity
    if (session && !isValidSession(session)) {
      console.warn('Invalid session detected, clearing...');
      await supabase.auth.signOut();
      return { session: null, error: 'Session validation failed' };
    }

    return { session, error: null };
  } catch (error: any) {
    console.error('Session initialization error:', error);
    const securityError = createSecurityError('SERVER_ERROR', error);
    return { session: null, error: securityError.userMessage };
  }
};

// Generate a client identifier for rate limiting (non-personal)
function getClientIdentifier(): string {
  // Use a combination of user agent and screen resolution as identifier
  // This is not personally identifiable but helps with rate limiting
  const ua = navigator.userAgent.slice(0, 50);
  const screen = `${window.screen.width}x${window.screen.height}`;
  return btoa(`${ua}-${screen}`).slice(0, 32);
}

// Validate session structure and expiration
function isValidSession(session: any): boolean {
  if (!session || typeof session !== 'object') return false;
  if (!session.access_token || !session.user) return false;
  if (!session.expires_at) return false;
  
  // Check if session is expired (with 5 minute buffer)
  const expiresAt = new Date(session.expires_at * 1000);
  const now = new Date();
  const buffer = 5 * 60 * 1000; // 5 minutes
  
  return expiresAt.getTime() > now.getTime() + buffer;
}

// Secure token refresh with validation
export const refreshSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error('Error refreshing session:', error);
      // Force logout on refresh failure
      await supabase.auth.signOut();
      throw createSecurityError('SESSION_EXPIRED', error);
    }

    if (session && !isValidSession(session)) {
      console.warn('Refreshed session failed validation');
      await supabase.auth.signOut();
      throw createSecurityError('SESSION_EXPIRED');
    }

    return { session, error: null };
  } catch (error) {
    const securityError = error instanceof Error && 'code' in error 
      ? error as any 
      : createSecurityError('SERVER_ERROR', error);
    return { session: null, error: securityError.userMessage };
  }
};
