
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import { upsertUserToken } from '@/api/userTokens';

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  hasProfile: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  loading: true,
  isAuthenticated: false,
  hasProfile: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  const createProfileForUser = async (userId: string): Promise<Profile | null> => {
    try {
      const { data: newProfile, error } = await supabase
        .from('profiles')
        .insert({ 
          id: userId,
          first_name: null,
          last_name: null,
          role: null
        })
        .select()
        .single();
        
      if (error) {
        console.error("Error creating profile:", error);
        return null;
      }
      
      return newProfile as Profile;
    } catch (err) {
      console.error("Profile creation exception:", err);
      return null;
    }
  };

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data: existingProfile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error("Profile fetch error:", error);
        return null;
      }
      
      if (existingProfile) {
        return existingProfile as Profile;
      }
      
      // No profile exists, create one
      return await createProfileForUser(userId);
    } catch (err) {
      console.error("Profile fetch exception:", err);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Handle Google token storage
          if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session.provider_token) {
            try {
              await upsertUserToken(session);
              queryClient.invalidateQueries({ queryKey: ['googleToken'] });
            } catch (error) {
              console.error("Failed to upsert user token", error);
            }
          }

          // Fetch or create profile
          const userProfile = await fetchProfile(session.user.id);
          if (mounted) {
            setProfile(userProfile);
          }
        } else {
          setProfile(null);
        }
        
        if (mounted) {
          setLoading(false);
        }
      }
    );

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        if (session?.user && mounted) {
          setSession(session);
          setUser(session.user);
          
          const userProfile = await fetchProfile(session.user.id);
          if (mounted) {
            setProfile(userProfile);
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [queryClient]);

  const value = {
    user,
    profile,
    session,
    loading,
    isAuthenticated: !!user,
    hasProfile: !!profile?.role,
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
