
-- This migration provides a definitive fix for the 'infinite recursion' bug
-- by removing all old, conflicting policies and creating a new, safe set.

-- Step 1: Drop all known policies from the 'children' table to ensure a clean slate.
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


-- Step 2: Drop all known policies from the 'child_access' table.
DROP POLICY IF EXISTS "Parents can manage access to their own children." ON public.child_access;
DROP POLICY IF EXISTS "Team members can see their own access records." ON public.child_access;
DROP POLICY IF EXISTS "RLS: Users can view child_access entries" ON public.child_access;
DROP POLICY IF EXISTS "RLS: Parents can grant access to their child" ON public.child_access;
DROP POLICY IF EXISTS "RLS: Parents can update access to their child" ON public.child_access;
DROP POLICY IF EXISTS "RLS: Parents can revoke access to their child" ON public.child_access;
DROP POLICY IF EXISTS "Parents can manage access grants for their children" ON public.child_access;
DROP POLICY IF EXISTS "Users can view their own access grant" ON public.child_access;
DROP POLICY IF EXISTS "Team members can view their own access grant" ON public.child_access;


-- Step 3: Recreate the helper function using CASCADE to ensure any lingering dependencies are removed.
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


-- Step 4: Create the new, simplified, and non-recursive policies.

-- Policies for the 'children' table
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;

-- Parents can do anything with their own child records.
CREATE POLICY "Parents can manage their own children"
  ON public.children FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Team members can view children they've been granted access to.
CREATE POLICY "Team members can view children they are granted access to"
  ON public.children FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.child_access ca WHERE ca.child_id = children.id AND ca.user_id = auth.uid()
  ));

-- Policies for the 'child_access' table
ALTER TABLE public.child_access ENABLE ROW LEVEL SECURITY;

-- Parents can create, update, and delete access grants for their children.
CREATE POLICY "Parents can manage access grants for their children"
  ON public.child_access FOR ALL
  USING (public.is_child_parent(child_id))
  WITH CHECK (public.is_child_parent(child_id));

-- Users (parents or team members) can view their own access grant records.
-- This is the key change that breaks the recursive loop.
CREATE POLICY "Users can view their own access grant"
  ON public.child_access FOR SELECT
  USING (auth.uid() = user_id);
