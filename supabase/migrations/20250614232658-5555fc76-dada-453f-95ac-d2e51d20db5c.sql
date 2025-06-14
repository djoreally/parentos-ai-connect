
-- Create a notification type enum
CREATE TYPE notification_type AS ENUM ('new_log', 'team_invite', 'alert');

-- Create the notifications table
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  log_id uuid REFERENCES public.logs(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX ON public.notifications (user_id);
CREATE INDEX ON public.notifications (user_id, is_read);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own notifications
CREATE POLICY "Users can select their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can update their own notifications (to mark as read)
CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add a function to create notifications for team members when a new log is added.
CREATE OR REPLACE FUNCTION public.handle_new_log_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  access_record record;
  notification_message TEXT;
  log_author_profile RECORD;
BEGIN
  -- Get the author's name from the profiles table
  SELECT p.first_name, p.last_name INTO log_author_profile
  FROM profiles p
  WHERE p.id = NEW.user_id;

  -- Construct the notification message
  IF log_author_profile.first_name IS NOT NULL THEN
    notification_message := log_author_profile.first_name || ' ' || COALESCE(log_author_profile.last_name, '') || ' added a new log: "' || (NEW.original_entry->>'title') || '"';
  ELSE
    notification_message := NEW.author || ' added a new log: "' || (NEW.original_entry->>'title') || '"';
  END IF;

  -- Iterate over all users with access to the child and create a notification for them
  -- except for the user who created the log
  FOR access_record IN
    SELECT ca.user_id
    FROM child_access ca
    WHERE ca.child_id = NEW.child_id AND ca.user_id != NEW.user_id
  LOOP
    INSERT INTO public.notifications (user_id, child_id, log_id, type, message)
    VALUES (access_record.user_id, NEW.child_id, NEW.id, 'new_log', notification_message);
  END LOOP;

  RETURN NEW;
END;
$$;

-- Create a trigger to call the function after a new log is inserted
CREATE TRIGGER on_new_log_created
  AFTER INSERT ON public.logs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_log_notification();
