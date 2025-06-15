
-- A misconfiguration in database security policies is causing the issues you're seeing.
-- The following commands will replace the existing policies with corrected versions to fix the problem.

-- First, a helper function to safely check for child ownership without causing recursion.
CREATE OR REPLACE FUNCTION public.is_child_parent(child_id_to_check uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.children
    WHERE id = child_id_to_check AND user_id = auth.uid()
  );
$$;

-- Ensure RLS is enabled on the tables. This is safe to run even if it's already enabled.
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_access ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies for 'children' table
DROP POLICY IF EXISTS "RLS: Users can view children they have access to" ON public.children;
CREATE POLICY "RLS: Users can view children they have access to"
ON public.children FOR SELECT
USING (
  (auth.uid() = user_id) OR
  (EXISTS (
    SELECT 1
    FROM public.child_access ca
    WHERE ca.child_id = children.id AND ca.user_id = auth.uid()
  ))
);

DROP POLICY IF EXISTS "RLS: Users can create their own child entries" ON public.children;
CREATE POLICY "RLS: Users can create their own child entries"
ON public.children FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "RLS: Parents can update their own child entries" ON public.children;
CREATE POLICY "RLS: Parents can update their own child entries"
ON public.children FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "RLS: Parents can delete their own child entries" ON public.children;
CREATE POLICY "RLS: Parents can delete their own child entries"
ON public.children FOR DELETE
USING (auth.uid() = user_id);


-- Drop and recreate policies for 'child_access' table
DROP POLICY IF EXISTS "RLS: Users can view child_access entries" ON public.child_access;
CREATE POLICY "RLS: Users can view child_access entries"
ON public.child_access FOR SELECT
USING (
  (auth.uid() = user_id) OR
  (public.is_child_parent(child_id))
);

DROP POLICY IF EXISTS "RLS: Parents can grant access to their child" ON public.child_access;
CREATE POLICY "RLS: Parents can grant access to their child"
ON public.child_access FOR INSERT
WITH CHECK (public.is_child_parent(child_id));

DROP POLICY IF EXISTS "RLS: Parents can update access to their child" ON public.child_access;
CREATE POLICY "RLS: Parents can update access to their child"
ON public.child_access FOR UPDATE
USING (public.is_child_parent(child_id));

DROP POLICY IF EXISTS "RLS: Parents can revoke access to their child" ON public.child_access;
CREATE POLICY "RLS: Parents can revoke access to their child"
ON public.child_access FOR DELETE
USING (public.is_child_parent(child_id));
