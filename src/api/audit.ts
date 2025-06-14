
import { supabase } from '@/integrations/supabase/client';

export type AuditAction = 
  | 'USER_LOGIN_SUCCESS' 
  | 'USER_LOGIN_FAIL'
  | 'USER_MFA_VERIFICATION_SUCCESS'
  | 'USER_MFA_VERIFICATION_FAIL';

export const logAuditEvent = async (
  action: AuditAction, 
  details?: Record<string, any>
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    // For login failures, the user might not be available yet.
    // The audit_logs table allows a null user_id to record these events.
    const userId = user?.id ?? null;

    // We can't get user's IP from the client-side, so we leave it null.
    // This could be implemented via a custom edge function in the future.
    const { error } = await supabase.from('audit_logs').insert({
      user_id: userId,
      action,
      details,
    });

    if (error) {
      console.error('Failed to log audit event:', error);
    }
  } catch (e) {
    console.error('Error logging audit event:', e);
  }
};
