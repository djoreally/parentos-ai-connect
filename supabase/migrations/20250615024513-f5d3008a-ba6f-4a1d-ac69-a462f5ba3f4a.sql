
-- Create a table to store third-party auth tokens for users
CREATE TABLE public.user_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  scopes TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, provider)
);

-- Enable Row-Level Security for the new table
ALTER TABLE public.user_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies to ensure users can only access their own tokens
CREATE POLICY "Users can manage their own tokens"
  ON public.user_tokens
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add columns to the appointments table for Google Calendar integration
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS google_meet_link TEXT,
ADD COLUMN IF NOT EXISTS google_event_id TEXT;

-- Create a trigger to set the updated_at timestamp automatically
CREATE TRIGGER handle_user_tokens_updated_at
BEFORE UPDATE ON public.user_tokens
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
