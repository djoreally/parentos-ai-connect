
-- This removes the policy that allows users to insert audit logs directly from the client.
-- Once this is removed, only secure server-side processes (like our new Edge Function) will be able to write to the audit log.
DROP POLICY "Users can insert their own audit logs" ON public.audit_logs;
