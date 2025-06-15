
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types';

export const useProfileManager = () => {
  const [error, setError] = useState<string | null>(null);

  const fetchOrCreateProfile = async (userId: string): Promise<Profile | null> => {
    try {
      setError(null);
      
      // First try to get existing profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching profile:', fetchError);
        setError(`Failed to fetch profile: ${fetchError.message}`);
        return null;
      }

      if (existingProfile) {
        return existingProfile as Profile;
      }

      // Create new profile if it doesn't exist
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          first_name: null,
          last_name: null,
          role: null
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating profile:', createError);
        setError(`Failed to create profile: ${createError.message}`);
        return null;
      }

      return newProfile as Profile;
    } catch (error: any) {
      console.error('Profile operation error:', error);
      setError(`Profile error: ${error.message}`);
      return null;
    }
  };

  return {
    fetchOrCreateProfile,
    profileError: error,
    setProfileError: setError,
  };
};
