
-- Create a status type for milestones
CREATE TYPE public.milestone_status AS ENUM ('not_yet', 'in_progress', 'achieved');

-- Create milestones table to store standard developmental milestones
CREATE TABLE public.milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL,
    age_group TEXT NOT NULL, -- e.g., "2 Months", "1 Year"
    description TEXT NOT NULL UNIQUE,
    source TEXT DEFAULT 'CDC',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.milestones IS 'Standard developmental milestones, e.g., from CDC.';

-- Enable RLS for milestones table
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read all standard milestones.
CREATE POLICY "Authenticated users can view all milestones"
ON public.milestones
FOR SELECT
TO authenticated
USING (true);

-- Create child_milestone_status table to track progress for each child
CREATE TABLE public.child_milestone_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    milestone_id UUID NOT NULL REFERENCES public.milestones(id) ON DELETE CASCADE,
    status public.milestone_status NOT NULL DEFAULT 'not_yet',
    notes TEXT,
    evidence_url TEXT, -- For photos/videos later
    updated_by_user_id UUID NOT NULL REFERENCES auth.users(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_child_milestone UNIQUE (child_id, milestone_id)
);
COMMENT ON TABLE public.child_milestone_status IS 'Tracks the status of developmental milestones for each child.';

-- Create a trigger to automatically update the 'updated_at' column
CREATE TRIGGER update_child_milestone_status_updated_at
BEFORE UPDATE ON public.child_milestone_status
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS for child_milestone_status table
ALTER TABLE public.child_milestone_status ENABLE ROW LEVEL SECURITY;

-- RLS policies for child_milestone_status table
CREATE POLICY "Users can view milestone status for children they have access to"
ON public.child_milestone_status FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.children c WHERE c.id = child_milestone_status.child_id AND c.user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.child_access ca WHERE ca.child_id = child_milestone_status.child_id AND ca.user_id = auth.uid())
);

CREATE POLICY "Users can insert milestone status for children they have access to"
ON public.child_milestone_status FOR INSERT TO authenticated
WITH CHECK (
  (updated_by_user_id = auth.uid()) AND
  (
    EXISTS (SELECT 1 FROM public.children c WHERE c.id = child_milestone_status.child_id AND c.user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.child_access ca WHERE ca.child_id = child_milestone_status.child_id AND ca.user_id = auth.uid())
  )
);

CREATE POLICY "Users can update milestone status for children they have access to"
ON public.child_milestone_status FOR UPDATE TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.children c WHERE c.id = child_milestone_status.child_id AND c.user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.child_access ca WHERE ca.child_id = child_milestone_status.child_id AND ca.user_id = auth.uid())
)
WITH CHECK (
  (updated_by_user_id = auth.uid())
);

CREATE POLICY "Users can delete milestone status for children they have access to"
ON public.child_milestone_status FOR DELETE TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.children c WHERE c.id = child_milestone_status.child_id AND c.user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.child_access ca WHERE ca.child_id = child_milestone_status.child_id AND ca.user_id = auth.uid())
);

-- Pre-populate milestones table with CDC data
INSERT INTO public.milestones (category, age_group, description) VALUES
('Social/Emotional', '2 Months', 'Calms down when spoken to or picked up'),
('Social/Emotional', '2 Months', 'Looks at your face'),
('Social/Emotional', '2 Months', 'Seems happy to see you when you walk up to them'),
('Social/Emotional', '2 Months', 'Smiles when you talk to or smile at them'),
('Language/Communication', '2 Months', 'Makes sounds other than crying'),
('Language/Communication', '2 Months', 'Reacts to loud sounds'),
('Cognitive', '2 Months', 'Watches you as you move'),
('Cognitive', '2 Months', 'Looks at a toy for several seconds'),
('Motor', '2 Months', 'Holds head up when on tummy'),
('Motor', '2 Months', 'Moves both arms and both legs'),
('Motor', '2 Months', 'Opens hands briefly'),
('Social/Emotional', '1 Year', 'Plays games with you, like pat-a-cake'),
('Language/Communication', '1 Year', 'Waves “bye-bye”'),
('Language/Communication', '1 Year', 'Calls a parent “mama” or “dada” or another special name'),
('Language/Communication', '1 Year', 'Understands “no” (pauses briefly or stops when you say it)'),
('Cognitive', '1 Year', 'Puts something in a container, like a block in a cup'),
('Cognitive', '1 Year', 'Looks for things they see you hide, like a toy under a blanket'),
('Motor', '1 Year', 'Pulls up to stand'),
('Motor', '1 Year', 'Walks, holding on to furniture'),
('Motor', '1 Year', 'Drinks from a cup without a lid, as you hold it'),
('Motor', '1 Year', 'Picks things up between thumb and pointer finger, like small bits of food');
