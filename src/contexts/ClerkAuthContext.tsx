import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Profile } from '@/types';
import { useProfileManager } from '@/hooks/useProfileManager';
import LoadingFallback from '@/components/LoadingFallback';
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

  const refreshProfile = async () => {
    if (!user) return;
    
    try {
      setError(null);
      const userProfile = await fetchOrCreateProfile(user.id);
      setProfile(userProfile);
    } catch (error: any) {
      console.error('Error refreshing profile:', error);
      setError('Failed to refresh profile');
      toast.error('Failed to load user profile. Please try refreshing the page.');
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      if (!isLoaded) return;
      
      setLoading(true);
      
      try {
        if (user) {
          console.log('Loading profile for user:', user.id);
          const userProfile = await fetchOrCreateProfile(user.id);
          setProfile(userProfile);
          console.log('Profile loaded successfully:', userProfile);
        } else {
          setProfile(null);
          console.log('No user found, clearing profile');
        }
      } catch (error: any) {
        console.error('Error loading profile:', error);
        setError('Failed to load profile');
        
        // Show user-friendly error message
        if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
          toast.error('Network error. Please check your connection and try again.');
        } else {
          toast.error('Failed to load user profile. Please try refreshing the page.');
        }
      } finally {
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

  // Show loading screen while auth is initializing
  if (!isLoaded || (loading && !error)) {
    return <LoadingFallback message="Initializing authentication..." />;
  }

  // Show error state if there's a critical error
  if (error && !profile && user) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-destructive">Authentication Error</h2>
          <p className="text-muted-foreground">Failed to load user profile</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

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