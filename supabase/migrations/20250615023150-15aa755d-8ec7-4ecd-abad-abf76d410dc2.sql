
ALTER TABLE public.child_access
ADD CONSTRAINT child_access_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
