
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types';
import { toast } from 'sonner';

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  loading: true,
  error: null,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

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

  const refreshProfile = async () => {
    if (!session?.user) return;
    
    try {
      setError(null);
      const userProfile = await fetchOrCreateProfile(session.user.id);
      setProfile(userProfile);
    } catch (error: any) {
      console.error('Error refreshing profile:', error);
      setError(`Failed to refresh profile: ${error.message}`);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        setError(`Sign out failed: ${error.message}`);
        toast.error('Failed to sign out. Please try again.');
      } else {
        toast.success('Signed out successfully');
      }
    } catch (error: any) {
      console.error('Unexpected error during sign out:', error);
      setError(`Unexpected error: ${error.message}`);
      toast.error('An unexpected error occurred during sign out');
    }
  };

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        setError(null);
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setError(`Session error: ${error.message}`);
          if (mounted) {
            setLoading(false);
            setInitialLoadComplete(true);
          }
          return;
        }

        if (session && mounted) {
          setSession(session);
          setUser(session.user);
          
          const userProfile = await fetchOrCreateProfile(session.user.id);
          if (mounted) {
            setProfile(userProfile);
          }
        }
      } catch (error: any) {
        console.error('Session initialization error:', error);
        setError(`Initialization error: ${error.message}`);
      } finally {
        if (mounted) {
          setLoading(false);
          setInitialLoadComplete(true);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, session?.user?.email);
        
        if (!mounted) return;

        try {
          setError(null);
          
          // Only show loading for subsequent auth changes after initial load
          if (initialLoadComplete) {
            setLoading(true);
          }

          setSession(session);
          setUser(session?.user ?? null);

          if (session?.user) {
            const userProfile = await fetchOrCreateProfile(session.user.id);
            if (mounted) {
              setProfile(userProfile);
            }
          } else {
            setProfile(null);
          }
        } catch (error: any) {
          console.error('Auth state change error:', error);
          setError(`Auth error: ${error.message}`);
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      }
    );

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [initialLoadComplete]);

  // Clear error after some time
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 10000); // Clear error after 10 seconds

      return () => clearTimeout(timer);
    }
  }, [error]);

  const value = {
    user,
    profile,
    session,
    loading,
    error,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
