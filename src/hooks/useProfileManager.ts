
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types';
import { createSecurityError, handleSecurityError } from '@/utils/errorHandler';
import { nameSchema } from '@/utils/validation';

export const useProfileManager = () => {
  const [error, setError] = useState<string | null>(null);

  const fetchOrCreateProfile = async (userId: string): Promise<Profile | null> => {
    try {
      setError(null);
      
      // Validate userId format (should be UUID)
      if (!userId || typeof userId !== 'string' || !isValidUUID(userId)) {
        const securityError = createSecurityError('VALIDATION_ERROR');
        setError(securityError.userMessage);
        return null;
      }
      
      // First try to get existing profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching profile:', fetchError);
        const securityError = createSecurityError('SERVER_ERROR', fetchError);
        setError(securityError.userMessage);
        return null;
      }

      if (existingProfile) {
        // Validate existing profile data
        if (!isValidProfile(existingProfile)) {
          console.warn('Invalid profile data detected');
          const securityError = createSecurityError('VALIDATION_ERROR');
          setError(securityError.userMessage);
          return null;
        }
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
        const securityError = createSecurityError('SERVER_ERROR', createError);
        setError(securityError.userMessage);
        return null;
      }

      return newProfile as Profile;
    } catch (error: any) {
      console.error('Profile operation error:', error);
      const securityError = createSecurityError('SERVER_ERROR', error);
      setError(securityError.userMessage);
      return null;
    }
  };

  const updateProfile = async (updates: Partial<Profile>): Promise<Profile | null> => {
    try {
      setError(null);

      // Validate updates
      if (updates.first_name !== undefined) {
        const validation = nameSchema.safeParse(updates.first_name);
        if (!validation.success) {
          const securityError = createSecurityError('VALIDATION_ERROR');
          setError(securityError.userMessage);
          return null;
        }
      }

      if (updates.last_name !== undefined) {
        const validation = nameSchema.safeParse(updates.last_name);
        if (!validation.success) {
          const securityError = createSecurityError('VALIDATION_ERROR');
          setError(securityError.userMessage);
          return null;
        }
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        const securityError = createSecurityError('AUTH_FAILED');
        setError(securityError.userMessage);
        return null;
      }

      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating profile:', updateError);
        const securityError = createSecurityError('SERVER_ERROR', updateError);
        setError(securityError.userMessage);
        return null;
      }

      return updatedProfile as Profile;
    } catch (error: any) {
      console.error('Profile update error:', error);
      const securityError = createSecurityError('SERVER_ERROR', error);
      setError(securityError.userMessage);
      return null;
    }
  };

  return {
    fetchOrCreateProfile,
    updateProfile,
    profileError: error,
    setProfileError: setError,
  };
};

// Validate UUID format
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Validate profile data structure
function isValidProfile(profile: any): boolean {
  if (!profile || typeof profile !== 'object') return false;
  if (!isValidUUID(profile.id)) return false;
  
  // Check for potential XSS in string fields
  const stringFields = ['first_name', 'last_name'];
  for (const field of stringFields) {
    if (profile[field] && typeof profile[field] === 'string') {
      if (containsPotentialXSS(profile[field])) return false;
    }
  }
  
  return true;
}

// Check for potential XSS patterns
function containsPotentialXSS(text: string): boolean {
  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
  ];
  
  return xssPatterns.some(pattern => pattern.test(text));
}
