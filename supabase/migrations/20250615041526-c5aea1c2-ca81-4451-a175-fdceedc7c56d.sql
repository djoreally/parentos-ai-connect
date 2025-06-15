
-- This script consolidates all previous Row Level Security (RLS) policies
-- into a single, definitive source of truth to resolve conflicts and warnings.
-- It drops all old policies and creates a clean, secure, and non-recursive set.

-- Step 1: Drop all known RLS policies from affected tables to ensure a clean slate.

-- Policies from 'children' table
DROP POLICY IF EXISTS "Users can view their own children" ON public.children;
DROP POLICY IF EXISTS "Users can insert their own children" ON public.children;
DROP POLICY IF EXISTS "Users can update their own children" ON public.children;
DROP POLICY IF EXISTS "Users can delete their own children" ON public.children;
DROP POLICY IF EXISTS "RLS: Users can view children they have access to" ON public.children;
DROP POLICY IF EXISTS "RLS: Users can create their own child entries" ON public.children;
DROP POLICY IF EXISTS "RLS: Parents can update their own child entries" ON public.children;
DROP POLICY IF EXISTS "RLS: Parents can delete their own child entries" ON public.children;
DROP POLICY IF EXISTS "Parents can perform all actions on their own children" ON public.children;
DROP POLICY IF EXISTS "Team members can view children they have access to" ON public.children;
DROP POLICY IF EXISTS "Team members can view children they are granted access to" ON public.children;
DROP POLICY IF EXISTS "Parents can manage their own children" ON public.children;

-- Policies from 'child_access' table
DROP POLICY IF EXISTS "Parents can manage access to their own children." ON public.child_access;
DROP POLICY IF EXISTS "Team members can see their own access records." ON public.child_access;
DROP POLICY IF EXISTS "RLS: Users can view child_access entries" ON public.child_access;
DROP POLICY IF EXISTS "RLS: Parents can grant access to their child" ON public.child_access;
DROP POLICY IF EXISTS "RLS: Parents can update access to their child" ON public.child_access;
DROP POLICY IF EXISTS "RLS: Parents can revoke access to their child" ON public.child_access;
DROP POLICY IF EXISTS "Parents can manage access grants for their children" ON public.child_access;
DROP POLICY IF EXISTS "Users can view their own access grant" ON public.child_access;
DROP POLICY IF EXISTS "Team members can view their own access grant" ON public.child_access;

-- Policies from 'logs' table
DROP POLICY IF EXISTS "Users can view logs for their children" ON public.logs;
DROP POLICY IF EXISTS "Users can insert logs for their children" ON public.logs;
DROP POLICY IF EXISTS "Users can view logs for children they have access to" ON public.logs;
DROP POLICY IF EXISTS "Users can insert logs for children they have access to" ON public.logs;
DROP POLICY IF EXISTS "Team can view logs" ON public.logs;
DROP POLICY IF EXISTS "Team can create logs" ON public.logs;
DROP POLICY IF EXISTS "Team can manage logs" ON public.logs;


-- Policies from 'messages' table
DROP POLICY IF EXISTS "Team members can view messages" ON public.messages;
DROP POLICY IF EXISTS "Team members can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can view messages for children they have access to" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages for children they have access to" ON public.messages;
DROP POLICY IF EXISTS "Team can view messages" ON public.messages;
DROP POLICY IF EXISTS "Team can send messages" ON public.messages;
DROP POLICY IF EXISTS "Team can view and send messages" ON public.messages;


-- Policies from 'profiles' table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "RLS: Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "RLS: Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- Policies from 'child_milestone_status' table
DROP POLICY IF EXISTS "Users can view milestone status for children they have access to" ON public.child_milestone_status;
DROP POLICY IF EXISTS "Users can insert milestone status for children they have access to" ON public.child_milestone_status;
DROP POLICY IF EXISTS "Users can update milestone status for children they have access to" ON public.child_milestone_status;
DROP POLICY IF EXISTS "Users can delete milestone status for children they have access to" ON public.child_milestone_status;
DROP POLICY IF EXISTS "Team can manage milestone statuses" ON public.child_milestone_status;

-- Policies from 'invitations' table
DROP POLICY IF EXISTS "Parents can create invitations for their children." ON public.invitations;
DROP POLICY IF EXISTS "Parents can view their own sent invitations." ON public.invitations;
DROP POLICY IF EXISTS "Invited users can view their own pending invitations." ON public.invitations;
DROP POLICY IF EXISTS "Parents can update their own invitations (e.g., revoke)." ON public.invitations;
DROP POLICY IF EXISTS "Parents can delete their own invitations." ON public.invitations;
DROP POLICY IF EXISTS "Parents can manage their invitations" ON public.invitations;
DROP POLICY IF EXISTS "Invited users can see their pending invitation" ON public.invitations;

-- Step 2: Recreate the helper function using CASCADE to ensure any lingering dependencies are removed.
DROP FUNCTION IF EXISTS public.is_child_parent(uuid) CASCADE;
CREATE OR REPLACE FUNCTION public.is_child_parent(child_id_to_check uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  -- This function securely checks if the current user is the parent of a given child,
  -- bypassing RLS to prevent recursion.
  SET search_path = public;
  RETURN EXISTS (
    SELECT 1 FROM children WHERE id = child_id_to_check AND user_id = auth.uid()
  );
END;
$$;


-- Step 3: Create the new, consolidated, and non-recursive policies for all tables.

-- Ensure RLS is enabled on all relevant tables
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_milestone_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Policies for 'children' table
CREATE POLICY "Parents can manage their own children"
  ON public.children FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Team members can view children they are granted access to"
  ON public.children FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.child_access ca WHERE ca.child_id = children.id AND ca.user_id = auth.uid()
  ));

-- Policies for 'child_access' table
CREATE POLICY "Parents can manage access grants for their children"
  ON public.child_access FOR ALL
  USING (public.is_child_parent(child_id))
  WITH CHECK (public.is_child_parent(child_id));

CREATE POLICY "Users can view their own access grant"
  ON public.child_access FOR SELECT
  USING (auth.uid() = user_id);
  
-- Policies for 'logs' table
CREATE POLICY "Team can manage logs"
ON public.logs FOR ALL
USING (
  (EXISTS (SELECT 1 FROM public.children c WHERE c.id = logs.child_id AND c.user_id = auth.uid())) OR
  (EXISTS (SELECT 1 FROM public.child_access ca WHERE ca.child_id = logs.child_id AND ca.user_id = auth.uid()))
)
WITH CHECK (
  (user_id = auth.uid()) AND
  (
    (EXISTS (SELECT 1 FROM public.children c WHERE c.id = logs.child_id AND c.user_id = auth.uid())) OR
    (EXISTS (SELECT 1 FROM public.child_access ca WHERE ca.child_id = logs.child_id AND ca.user_id = auth.uid()))
  )
);

-- Policies for 'messages' table
CREATE POLICY "Team can manage messages"
ON public.messages FOR ALL
USING (
  (EXISTS (SELECT 1 FROM public.children c WHERE c.id = messages.child_id AND c.user_id = auth.uid())) OR
  (EXISTS (SELECT 1 FROM public.child_access ca WHERE ca.child_id = messages.child_id AND ca.user_id = auth.uid()))
)
WITH CHECK (
  (user_id = auth.uid()) AND
  (
    (EXISTS (SELECT 1 FROM public.children c WHERE c.id = messages.child_id AND c.user_id = auth.uid())) OR
    (EXISTS (SELECT 1 FROM public.child_access ca WHERE ca.child_id = messages.child_id AND ca.user_id = auth.uid()))
  )
);

-- Policies for 'profiles' table
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policies for 'child_milestone_status' table
CREATE POLICY "Team can manage milestone statuses"
ON public.child_milestone_status FOR ALL
USING (
  (EXISTS (SELECT 1 FROM public.children c WHERE c.id = child_milestone_status.child_id AND c.user_id = auth.uid())) OR
  (EXISTS (SELECT 1 FROM public.child_access ca WHERE ca.child_id = child_milestone_status.child_id AND ca.user_id = auth.uid()))
)
WITH CHECK (
  (updated_by_user_id = auth.uid()) AND
  (
    (EXISTS (SELECT 1 FROM public.children c WHERE c.id = child_milestone_status.child_id AND c.user_id = auth.uid())) OR
    (EXISTS (SELECT 1 FROM public.child_access ca WHERE ca.child_id = child_milestone_status.child_id AND ca.user_id = auth.uid()))
  )
);

-- Policies for 'invitations' table
CREATE POLICY "Parents can manage their invitations"
ON public.invitations FOR ALL
TO authenticated
USING (parent_user_id = auth.uid())
WITH CHECK (parent_user_id = auth.uid());

CREATE POLICY "Invited users can see their pending invitation"
ON public.invitations FOR SELECT
TO authenticated
USING (invitee_email = auth.email());
