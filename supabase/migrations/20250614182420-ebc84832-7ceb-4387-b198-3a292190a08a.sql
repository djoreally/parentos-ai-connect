
    -- Create a new ENUM type for invitation status
    CREATE TYPE public.invitation_status AS ENUM ('pending', 'accepted', 'expired', 'revoked');

    -- Create a table to store invitation details
    CREATE TABLE public.invitations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        parent_user_id UUID NOT NULL,
        invitee_email TEXT NOT NULL,
        child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
        role public.user_role NOT NULL,
        token TEXT NOT NULL UNIQUE,
        status public.invitation_status NOT NULL DEFAULT 'pending',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        expires_at TIMESTAMPTZ NOT NULL DEFAULT now() + interval '7 days'
    );
    COMMENT ON TABLE public.invitations IS 'Stores invitations for team members to access child data.';

    -- Create a table to manage team member access to children
    CREATE TABLE public.child_access (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
        user_id UUID NOT NULL, -- The user being granted access
        role public.user_role NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE(child_id, user_id)
    );
    COMMENT ON TABLE public.child_access IS 'Manages which team members have access to which children.';

    -- Enable Row Level Security and define policies for the 'invitations' table
    ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Parents can create invitations for their children."
    ON public.invitations FOR INSERT
    TO authenticated
    WITH CHECK (parent_user_id = auth.uid() AND (
        EXISTS (SELECT 1 FROM public.children WHERE id = invitations.child_id AND user_id = auth.uid())
    ));

    CREATE POLICY "Parents can view their sent invitations."
    ON public.invitations FOR SELECT
    TO authenticated
    USING (parent_user_id = auth.uid());

    CREATE POLICY "Parents can update their own invitations (e.g., revoke)."
    ON public.invitations FOR UPDATE
    TO authenticated
    USING (parent_user_id = auth.uid());

    -- Enable Row Level Security and define policies for the 'child_access' table
    ALTER TABLE public.child_access ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Parents can manage access to their own children."
    ON public.child_access FOR ALL
    TO authenticated
    USING ((EXISTS (SELECT 1 FROM public.children WHERE id = child_access.child_id AND user_id = auth.uid())));

    CREATE POLICY "Team members can see their own access records."
    ON public.child_access FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

    