
-- Add target_entity and target_id columns for more detailed auditing
ALTER TABLE public.audit_logs
ADD COLUMN IF NOT EXISTS target_entity TEXT,
ADD COLUMN IF NOT EXISTS target_id TEXT;

-- Add comments for clarity
COMMENT ON COLUMN public.audit_logs.target_entity IS 'The type of entity the action was performed on (e.g., "child", "log", "user").';
COMMENT ON COLUMN public.audit_logs.target_id IS 'The ID of the entity the action was performed on.';
