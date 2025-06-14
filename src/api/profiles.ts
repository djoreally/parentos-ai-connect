
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types';

export type ProfileUpdate = {
  role?: 'Parent' | 'Teacher' | 'Doctor' | 'Admin';
  first_name?: string;
  last_name?: string;
};

// Get the current user's profile
export const getProfile = async (): Promise<Profile | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }

  return data;
};

// Update a user's profile
export const updateProfile = async (profileData: ProfileUpdate): Promise<Profile> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    throw error;
  }

  return data;
};
