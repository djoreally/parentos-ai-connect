
-- Securing 'children' table: Add WITH CHECK to the update policy
-- This prevents a user from changing the owner of a child record.
DROP POLICY IF EXISTS "Users can update their own children" ON public.children;
CREATE POLICY "Users can update their own children"
ON public.children FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Securing 'invitations' table: Add WITH CHECK to the update policy
-- This prevents a user from reassigning an invitation to another parent.
DROP POLICY IF EXISTS "Parents can update their own invitations (e.g., revoke)." ON public.invitations;
CREATE POLICY "Parents can update their own invitations (e.g., revoke)."
ON public.invitations FOR UPDATE
TO authenticated
USING (parent_user_id = auth.uid())
WITH CHECK (parent_user_id = auth.uid());

-- Broadening 'logs' access: Update policies to include team members
-- This allows both the parent owner and any user with granted access via 'child_access' to view and create logs.
DROP POLICY IF EXISTS "Users can view logs for their children" ON public.logs;
CREATE POLICY "Team can view logs"
ON public.logs FOR SELECT
USING (
  (EXISTS (SELECT 1 FROM children WHERE children.id = logs.child_id AND children.user_id = auth.uid())) OR
  (EXISTS (SELECT 1 FROM child_access WHERE child_access.child_id = logs.child_id AND child_access.user_id = auth.uid()))
);

DROP POLICY IF EXISTS "Users can insert logs for their children" ON public.logs;
CREATE POLICY "Team can create logs"
ON public.logs FOR INSERT
WITH CHECK (
  (EXISTS (SELECT 1 FROM children WHERE children.id = logs.child_id AND children.user_id = auth.uid())) OR
  (EXISTS (SELECT 1 FROM child_access WHERE child_access.child_id = logs.child_id AND child_access.user_id = auth.uid()))
);

-- Securing 'messages' table: Add RLS policies
-- This ensures only the parent and authorized team members can read or write messages.
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team can view messages"
ON public.messages FOR SELECT
USING (
  (EXISTS (SELECT 1 FROM children WHERE children.id = messages.child_id AND children.user_id = auth.uid())) OR
  (EXISTS (SELECT 1 FROM child_access WHERE child_access.child_id = messages.child_id AND child_access.user_id = auth.uid()))
);
CREATE POLICY "Team can send messages"
ON public.messages FOR INSERT
WITH CHECK (
  (EXISTS (SELECT 1 FROM children WHERE children.id = messages.child_id AND children.user_id = auth.uid())) OR
  (EXISTS (SELECT 1 FROM child_access WHERE child_access.child_id = messages.child_id AND child_access.user_id = auth.uid()))
);

-- Improving 'profiles' access: Allow authenticated users to view profiles
-- This is necessary for features like showing user names in the team chat.
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- Also, secure the 'profiles' update policy with WITH CHECK.
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Securing 'child_milestone_status': Add RLS policies
-- This ensures only parents and authorized team members can manage milestone statuses.
ALTER TABLE public.child_milestone_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team can manage milestone statuses"
ON public.child_milestone_status FOR ALL -- ALL covers INSERT, UPDATE, DELETE
USING (
  (EXISTS (SELECT 1 FROM children WHERE children.id = child_milestone_status.child_id AND children.user_id = auth.uid())) OR
  (EXISTS (SELECT 1 FROM child_access WHERE child_access.child_id = child_milestone_status.child_id AND child_access.user_id = auth.uid()))
)
WITH CHECK (
  (EXISTS (SELECT 1 FROM children WHERE children.id = child_milestone_status.child_id AND children.user_id = auth.uid())) OR
  (EXISTS (SELECT 1 FROM child_access WHERE child_access.child_id = child_milestone_status.child_id AND child_access.user_id = auth.uid()))
);
