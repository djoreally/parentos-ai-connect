
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Profile } from '@/types';
import { useProfileManager } from '@/hooks/useProfileManager';

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
          const userProfile = await fetchOrCreateProfile(user.id);
          setProfile(userProfile);
        } catch (error: any) {
          console.error('Error loading profile:', error);
          setError('Failed to load profile');
        }
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    };

    loadProfile();
  }, [user, isLoaded]);

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
