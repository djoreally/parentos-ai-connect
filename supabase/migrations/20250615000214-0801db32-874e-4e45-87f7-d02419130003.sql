
-- 1. Add policy to allow team members to view children they have access to.
-- This is in addition to the parent's ability to view their own children.
CREATE POLICY "Team members can view children they are granted access to"
ON public.children
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.child_access ca
    WHERE ca.child_id = public.children.id AND ca.user_id = auth.uid()
  )
);

-- 2. Update log policies to allow access for parents AND team members.
-- We drop the old restrictive policies and create new, more comprehensive ones.
DROP POLICY IF EXISTS "Users can view logs for their children" ON public.logs;
DROP POLICY IF EXISTS "Users can insert logs for their children" ON public.logs;

CREATE POLICY "Users can view logs for children they have access to"
ON public.logs
FOR SELECT
TO authenticated
USING (
  -- User is the parent
  EXISTS (
    SELECT 1 FROM public.children c
    WHERE c.id = logs.child_id AND c.user_id = auth.uid()
  ) OR
  -- User is a team member
  EXISTS (
    SELECT 1 FROM public.child_access ca
    WHERE ca.child_id = logs.child_id AND ca.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert logs for children they have access to"
ON public.logs
FOR INSERT
TO authenticated
WITH CHECK (
  -- User is the parent
  EXISTS (
    SELECT 1 FROM public.children c
    WHERE c.id = logs.child_id AND c.user_id = auth.uid()
  ) OR
  -- User is a team member
  EXISTS (
    SELECT 1 FROM public.child_access ca
    WHERE ca.child_id = logs.child_id AND ca.user_id = auth.uid()
  )
);


-- 3. Update message policies to allow access for parents AND team members.
DROP POLICY IF EXISTS "Team members can view messages" ON public.messages;
DROP POLICY IF EXISTS "Team members can send messages" ON public.messages;

CREATE POLICY "Users can view messages for children they have access to"
ON public.messages
FOR SELECT
TO authenticated
USING (
  -- User is the parent
  EXISTS (
    SELECT 1 FROM public.children c
    WHERE c.id = messages.child_id AND c.user_id = auth.uid()
  ) OR
  -- User is a team member
  EXISTS (
    SELECT 1 FROM public.child_access ca
    WHERE ca.child_id = messages.child_id AND ca.user_id = auth.uid()
  )
);

CREATE POLICY "Users can send messages for children they have access to"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (
  -- User is the parent
  EXISTS (
    SELECT 1 FROM public.children c
    WHERE c.id = messages.child_id AND c.user_id = auth.uid()
  ) OR
  -- User is a team member
  EXISTS (
    SELECT 1 FROM public.child_access ca
    WHERE ca.child_id = messages.child_id AND ca.user_id = auth.uid()
  )
);

-- 4. Update profiles policy to allow any authenticated user to view profiles.
-- This is a common pattern in collaborative apps to allow displaying user names.
-- The existing policy is too restrictive, only allowing users to see their own profile.
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Authenticated users can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);
