
-- Create audit_logs table to record important user actions
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details JSONB,
    ip_address INET
);

-- Add a comment to explain the table's purpose
COMMENT ON TABLE public.audit_logs IS 'Records important user actions for security, compliance, and auditing.';

-- Enable Row Level Security to protect audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create a policy allowing users to insert their own audit events.
-- NOTE: For higher security, this should eventually be replaced by a service_role call from an edge function.
CREATE POLICY "Users can insert their own audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create a policy to prevent users from viewing, updating, or deleting audit logs from the client.
-- NOTE: A privileged 'auditor' role could be granted specific access in the future.
CREATE POLICY "Deny all client-side read, update, delete"
ON public.audit_logs
FOR ALL
USING (false);

