
-- This migration fixes a critical bug in the database security policies that caused
-- data to disappear from your dashboard, and also adds the missing policies
-- to allow saving your profile information.

-- Step 1: Fix the helper function to prevent database errors (infinite recursion).
-- Using CASCADE will also drop the policies that depend on this function.
-- They will be recreated correctly in Step 2.
DROP FUNCTION IF EXISTS public.is_child_parent(uuid) CASCADE;
CREATE OR REPLACE FUNCTION public.is_child_parent(child_id_to_check uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  -- Setting search_path inside a plpgsql SECURITY DEFINER function is a robust
  -- way to ensure it runs correctly and securely, avoiding RLS recursion.
  SET search_path = public;
  RETURN EXISTS (
    SELECT 1
    FROM children
    WHERE id = child_id_to_check AND user_id = auth.uid()
  );
END;
$$;


-- Step 2: Re-apply all policies for 'children' and 'child_access' to be safe.
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "RLS: Users can view children they have access to" ON public.children;
CREATE POLICY "RLS: Users can view children they have access to"
ON public.children FOR SELECT USING (((auth.uid() = user_id) OR (EXISTS ( SELECT 1 FROM public.child_access ca WHERE ((ca.child_id = children.id) AND (ca.user_id = auth.uid()))))));
DROP POLICY IF EXISTS "RLS: Users can create their own child entries" ON public.children;
CREATE POLICY "RLS: Users can create their own child entries"
ON public.children FOR INSERT WITH CHECK ((auth.uid() = user_id));
DROP POLICY IF EXISTS "RLS: Parents can update their own child entries" ON public.children;
CREATE POLICY "RLS: Parents can update their own child entries"
ON public.children FOR UPDATE USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
DROP POLICY IF EXISTS "RLS: Parents can delete their own child entries" ON public.children;
CREATE POLICY "RLS: Parents can delete their own child entries"
ON public.children FOR DELETE USING ((auth.uid() = user_id));

ALTER TABLE public.child_access ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "RLS: Users can view child_access entries" ON public.child_access;
CREATE POLICY "RLS: Users can view child_access entries"
ON public.child_access FOR SELECT USING (((auth.uid() = user_id) OR public.is_child_parent(child_id)));
DROP POLICY IF EXISTS "RLS: Parents can grant access to their child" ON public.child_access;
CREATE POLICY "RLS: Parents can grant access to their child"
ON public.child_access FOR INSERT WITH CHECK (public.is_child_parent(child_id));
DROP POLICY IF EXISTS "RLS: Parents can update access to their child" ON public.child_access;
CREATE POLICY "RLS: Parents can update access to their child"
ON public.child_access FOR UPDATE USING (public.is_child_parent(child_id)) WITH CHECK (public.is_child_parent(child_id));
DROP POLICY IF EXISTS "RLS: Parents can revoke access to their child" ON public.child_access;
CREATE POLICY "RLS: Parents can revoke access to their child"
ON public.child_access FOR DELETE USING (public.is_child_parent(child_id));


-- Step 3: Add missing security policies for the 'profiles' table.
-- This will fix the issue with saving your profile information.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "RLS: Users can view their own profile" ON public.profiles;
CREATE POLICY "RLS: Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "RLS: Users can update their own profile" ON public.profiles;
CREATE POLICY "RLS: Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
