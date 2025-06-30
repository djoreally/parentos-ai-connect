import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Profile } from '@/types';
import { useProfileManager } from '@/hooks/useProfileManager';
import { toast } from 'sonner';

interface ClerkAuthContextType {
  user: any;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
}

const ClerkAuthContext = createContext<ClerkAuthContextType>({
  user: null,
  profile: null,
  loading: true,
  error: null,
  refreshProfile: async () => {},
});

export const ClerkAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoaded } = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { fetchOrCreateProfile } = useProfileManager();
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const refreshProfile = async () => {
    if (!user) return;
    
    try {
      setError(null);
      const userProfile = await fetchOrCreateProfile(user.id);
      setProfile(userProfile);
    } catch (error: any) {
      console.error('Error refreshing profile:', error);
      setError('Failed to refresh profile');
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      if (!isLoaded) return;
      
      setLoading(true);
      
      if (user) {
        try {
          console.log('Loading profile for user:', user.id);
          const userProfile = await fetchOrCreateProfile(user.id);
          setProfile(userProfile);
          setError(null);
          console.log('Profile loaded successfully:', userProfile);
        } catch (error: any) {
          console.error('Error loading profile:', error);
          setError('Failed to load profile');
          
          // Retry logic for network errors
          if (retryCount < MAX_RETRIES && 
              (error.message?.includes('network') || 
               error.message?.includes('fetch'))) {
            const nextRetry = retryCount + 1;
            setRetryCount(nextRetry);
            
            const delay = Math.min(1000 * 2 ** nextRetry, 10000);
            console.log(`Retrying profile load (${nextRetry}/${MAX_RETRIES}) in ${delay}ms`);
            
            setTimeout(() => {
              loadProfile();
            }, delay);
          } else if (retryCount >= MAX_RETRIES) {
            toast.error('Failed to load user profile after multiple attempts. Please refresh the page.');
          }
        } finally {
          if (retryCount === 0) {
            setLoading(false);
          }
        }
      } else {
        setProfile(null);
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, isLoaded, fetchOrCreateProfile]);

  const value: ClerkAuthContextType = {
    user,
    profile,
    loading: loading || !isLoaded,
    error,
    refreshProfile,
  };

  return (
    <ClerkAuthContext.Provider value={value}>
      {children}
    </ClerkAuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(ClerkAuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a ClerkAuthProvider');
  }
  return context;
};