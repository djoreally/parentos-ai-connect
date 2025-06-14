
-- Add 'new_message' to notification_type enum
ALTER TYPE notification_type ADD VALUE 'new_message';

-- Create messages table for team communication per child
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX ON public.messages (child_id, created_at DESC);
CREATE INDEX ON public.messages (user_id);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users with access to a child can view messages for that child.
CREATE POLICY "Team members can view messages"
ON public.messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM child_access ca
    WHERE ca.child_id = messages.child_id AND ca.user_id = auth.uid()
  )
);

-- Policy: Users with access to a child can send messages for that child.
CREATE POLICY "Team members can send messages"
ON public.messages
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM child_access ca
    WHERE ca.child_id = messages.child_id AND ca.user_id = auth.uid()
  )
);

-- Add a function to create notifications for team members when a new message is added.
CREATE OR REPLACE FUNCTION public.handle_new_message_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  access_record record;
  notification_message TEXT;
  message_author_profile RECORD;
  child_name_record RECORD;
  message_preview TEXT;
BEGIN
  -- Get the author's name from the profiles table
  SELECT p.first_name, p.last_name INTO message_author_profile
  FROM profiles p
  WHERE p.id = NEW.user_id;

  -- Get child's name
  SELECT c.name INTO child_name_record
  FROM children c
  WHERE c.id = NEW.child_id;

  -- Create a preview of the message content
  message_preview := substr(NEW.content, 1, 40);
  IF length(NEW.content) > 40 THEN
    message_preview := message_preview || '...';
  END IF;

  -- Construct the notification message
  IF message_author_profile.first_name IS NOT NULL THEN
    notification_message := message_author_profile.first_name || ' in ' || child_name_record.name || '''s chat: "' || message_preview || '"';
  ELSE
    -- Fallback, though user should have a profile.
    notification_message := 'New message in ' || child_name_record.name || '''s chat: "' || message_preview || '"';
  END IF;

  -- Iterate over all users with access to the child and create a notification for them
  -- except for the user who created the message
  FOR access_record IN
    SELECT ca.user_id
    FROM child_access ca
    WHERE ca.child_id = NEW.child_id AND ca.user_id != NEW.user_id
  LOOP
    INSERT INTO public.notifications (user_id, child_id, type, message)
    VALUES (access_record.user_id, NEW.child_id, 'new_message', notification_message);
  END LOOP;

  RETURN NEW;
END;
$$;

-- Create a trigger to call the function after a new message is inserted
CREATE TRIGGER on_new_message_created
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_message_notification();
