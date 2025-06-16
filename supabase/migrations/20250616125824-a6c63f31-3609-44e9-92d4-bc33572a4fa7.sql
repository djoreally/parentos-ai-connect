
-- Create table for application features
CREATE TABLE public.app_features (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  category text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create table for application roles (separate from user roles)
CREATE TABLE public.app_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  is_system_role boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create junction table for role-feature permissions
CREATE TABLE public.role_feature_permissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role_id uuid REFERENCES public.app_roles(id) ON DELETE CASCADE,
  feature_id uuid REFERENCES public.app_features(id) ON DELETE CASCADE,
  can_access boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(role_id, feature_id)
);

-- Add RLS policies
ALTER TABLE public.app_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_feature_permissions ENABLE ROW LEVEL SECURITY;

-- Admin users can manage everything
CREATE POLICY "Admins can manage app_features" ON public.app_features FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin')
);

CREATE POLICY "Admins can manage app_roles" ON public.app_roles FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin')
);

CREATE POLICY "Admins can manage role_feature_permissions" ON public.role_feature_permissions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin')
);

-- All authenticated users can read (for permission checking)
CREATE POLICY "Authenticated users can read app_features" ON public.app_features FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read app_roles" ON public.app_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read role_feature_permissions" ON public.role_feature_permissions FOR SELECT TO authenticated USING (true);

-- Insert the roles and features from your matrix
INSERT INTO public.app_roles (name, description, is_system_role) VALUES
('Parent / Guardian', 'Primary caregiver with full access to child data', true),
('Teacher', 'Educational professional with classroom insights', true),
('Therapist', 'Healthcare professional providing therapy services', true),
('School Counselor', 'School-based support professional', true),
('Nanny / Babysitter', 'Childcare provider', true),
('Coach / Instructor', 'Sports or activity instructor', true),
('Extended Family', 'Family members with limited access', true),
('Case Worker', 'Social services professional', true);

INSERT INTO public.app_features (name, description, category) VALUES
('Add/Edit Child Profile', 'Create and modify child profiles', 'Profile Management'),
('View Unified Timeline', 'Access to child timeline and history', 'Data Access'),
('Add Observations / Notes', 'Add notes and observations about child', 'Data Entry'),
('Attach Photos / Files', 'Upload and attach media files', 'Media'),
('AI-Powered Summaries & Trends', 'Access AI-generated insights', 'Analytics'),
('Create & Assign Tags', 'Manage content tags and categories', 'Organization'),
('Send/Receive Messages', 'Team communication features', 'Communication'),
('Comment on Updates', 'Comment on timeline entries', 'Communication'),
('Export Timeline for Reports', 'Generate and download reports', 'Reports'),
('Care Team Invites & Role Management', 'Manage team members and permissions', 'Administration'),
('Privacy & Access Controls', 'Manage privacy settings', 'Administration'),
('View Milestone Tracker', 'Access developmental milestones', 'Development'),
('Set Reminders / Daily Logs', 'Create reminders and daily entries', 'Organization'),
('Prepare Doctor Visit Summary', 'Generate medical visit summaries', 'Medical');

-- Add trigger for updated_at
CREATE TRIGGER update_app_features_updated_at BEFORE UPDATE ON public.app_features FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_app_roles_updated_at BEFORE UPDATE ON public.app_roles FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_role_feature_permissions_updated_at BEFORE UPDATE ON public.role_feature_permissions FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
