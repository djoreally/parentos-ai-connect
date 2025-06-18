
import { supabase } from '@/integrations/supabase/client';

export interface AuthAttempt {
  email: string;
  ip_address?: string;
  attempt_type: 'login_success' | 'login_failed' | 'signup_attempt' | 'password_reset';
  user_agent?: string;
}

export const logAuthAttempt = async (attempt: AuthAttempt): Promise<void> => {
  try {
    // Get IP address from request headers if available
    const ip_address = attempt.ip_address || 
      (typeof window !== 'undefined' ? undefined : '127.0.0.1');
    
    // Get user agent if available
    const user_agent = attempt.user_agent || 
      (typeof window !== 'undefined' ? navigator.userAgent : undefined);

    await supabase.from('auth_attempts').insert({
      email: attempt.email,
      ip_address,
      attempt_type: attempt.attempt_type,
      user_agent
    });
  } catch (error) {
    // Log but don't throw - auth logging shouldn't break auth flow
    console.error('Failed to log auth attempt:', error);
  }
};

export const checkForSuspiciousActivity = async (email: string): Promise<boolean> => {
  try {
    // Check for too many failed attempts in the last 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    
    const { data, error } = await supabase
      .from('auth_attempts')
      .select('*')
      .eq('email', email)
      .eq('attempt_type', 'login_failed')
      .gte('created_at', fifteenMinutesAgo.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error checking suspicious activity:', error);
      return false;
    }

    // Block if more than 5 failed attempts in 15 minutes
    return (data?.length || 0) >= 5;
  } catch (error) {
    console.error('Error checking suspicious activity:', error);
    return false;
  }
};
