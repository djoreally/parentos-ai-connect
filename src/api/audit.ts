
import { supabase } from '@/integrations/supabase/client';

export type AuditAction = 
  | 'USER_LOGIN_SUCCESS' 
  | 'USER_LOGIN_FAIL'
  | 'USER_MFA_VERIFICATION_SUCCESS'
  | 'USER_MFA_VERIFICATION_FAIL'
  | 'LOG_CREATED'
  | 'LOG_UPDATED'
  | 'LOG_DELETED'
  | 'PDF_DIGEST_GENERATED';

export const logAuditEvent = async (
  action: AuditAction, 
  options: {
    details?: Record<string, any>;
    target_entity?: string;
    target_id?: string;
  } = {}
) => {
  try {
    // Invoke the secure edge function to log the event
    const { error } = await supabase.functions.invoke('log-audit-event', {
      body: {
        action,
        ...options,
      },
    });

    if (error) {
      console.error('Failed to log audit event via edge function:', error);
    }
  } catch (e) {
    console.error('Error invoking audit event logger:', e);
  }
};
