
-- Create custom types for roles and log entry types
CREATE TYPE public.author_role AS ENUM ('Parent', 'Teacher', 'Doctor');
CREATE TYPE public.log_type AS ENUM ('text', 'voice', 'document');

-- Create a table for children
CREATE TABLE public.children (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    avatar_url text,
    ai_summary text,
    dob date NOT NULL,
    allergies text[],
    medications text[],
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add comments for clarity
COMMENT ON TABLE public.children IS 'Stores child profiles, linked to a parent user.';
COMMENT ON COLUMN public.children.user_id IS 'The parent user who owns this child record.';

-- Enable Row Level Security for the children table
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;

-- Policies for children table
CREATE POLICY "Users can view their own children"
ON public.children FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own children"
ON public.children FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own children"
ON public.children FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own children"
ON public.children FOR DELETE
USING (auth.uid() = user_id);


-- Create a table for logs
CREATE TABLE public.logs (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    timestamp timestamp with time zone NOT NULL DEFAULT now(),
    author public.author_role NOT NULL,
    type public.log_type NOT NULL,
    original_entry jsonb NOT NULL,
    summary_for_teacher text,
    summary_for_doctor text,
    tags text[],
    emotion_score integer,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add comments for clarity
COMMENT ON TABLE public.logs IS 'Stores timeline entries for each child.';
COMMENT ON COLUMN public.logs.user_id IS 'The user who created the log entry.';
COMMENT ON COLUMN public.logs.child_id IS 'The child this log entry belongs to.';

-- Enable Row Level Security for the logs table
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

-- Policies for logs table
CREATE POLICY "Users can view logs for their children"
ON public.logs FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.children
    WHERE children.id = logs.child_id AND children.user_id = auth.uid()
));

CREATE POLICY "Users can insert logs for their children"
ON public.logs FOR INSERT
WITH CHECK (EXISTS (
    SELECT 1 FROM public.children
    WHERE children.id = logs.child_id AND children.user_id = auth.uid()
));

CREATE POLICY "Users can update logs they created"
ON public.logs FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete logs they created"
ON public.logs FOR DELETE
USING (auth.uid() = user_id);

