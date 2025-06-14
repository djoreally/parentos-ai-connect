
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export type AuditLog = Tables<'audit_logs'> & {
    profiles: { first_name: string | null, last_name: string | null } | null;
};


export const getAuditLogs = async (): Promise<AuditLog[]> => {
    const { data, error } = await supabase
      .from('audit_logs')
      .select(`
        *,
        profiles (
          first_name,
          last_name
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
        console.error('Error fetching audit logs:', error);
        throw error;
    }

    return data as AuditLog[];
};
