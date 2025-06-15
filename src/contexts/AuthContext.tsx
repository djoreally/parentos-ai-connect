
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
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  const fetchOrCreateProfile = async (userId: string): Promise<Profile | null> => {
    try {
      // Try to get existing profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (fetchError) {
        console.error("Profile fetch error:", fetchError);
        return null;
      }
      
      if (existingProfile) {
        return existingProfile as Profile;
      }
      
      // Create profile if it doesn't exist
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
        console.error("Error creating profile:", createError);
        return null;
      }
      
      return newProfile as Profile;
    } catch (err) {
      console.error("Profile fetch/create exception:", err);
      return null;
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const userProfile = await fetchOrCreateProfile(session.user.id);
          setProfile(userProfile);

          // Handle Google token storage
          if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session.provider_token) {
            try {
              await upsertUserToken(session);
              queryClient.invalidateQueries({ queryKey: ['googleToken'] });
            } catch (error) {
              console.error("Failed to upsert user token", error);
            }
          }
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setSession(session);
          setUser(session.user);
          const userProfile = await fetchOrCreateProfile(session.user.id);
          setProfile(userProfile);
        }
      } catch (error) {
        console.error("Error getting initial session:", error);
      } finally {
        setLoading(false);
      }
    };
    
    getInitialSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  const value = {
    user,
    profile,
    session,
    loading,
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
