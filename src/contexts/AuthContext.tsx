
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

  const fetchUserProfile = async (userId: string) => {
    console.log("[AuthContext] Fetching profile for user:", userId);
    try {
      // First, try to get existing profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (fetchError) {
        console.error("[AuthContext] Profile fetch error:", fetchError);
        return null;
      }
      
      console.log("[AuthContext] Existing profile found:", existingProfile);
      
      // If profile exists, return it
      if (existingProfile) {
        return existingProfile as Profile;
      }
      
      // If no profile exists, create one
      console.log("[AuthContext] No profile found, creating one...");
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
        console.error("[AuthContext] Error creating profile:", createError);
        return null;
      }
      
      console.log("[AuthContext] Created new profile:", newProfile);
      return newProfile as Profile;
    } catch (err) {
      console.error("[AuthContext] Profile fetch exception:", err);
      return null;
    }
  };

  useEffect(() => {
    console.log("[AuthContext] useEffect entered");

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("[AuthContext] onAuthStateChange:", event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          console.log("[AuthContext] User found, fetching profile...");
          const userProfile = await fetchUserProfile(session.user.id);
          console.log("[AuthContext] Profile result:", userProfile);
          setProfile(userProfile);

          if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session.provider_token) {
            try {
              await upsertUserToken(session);
              queryClient.invalidateQueries({ queryKey: ['googleToken'] });
            } catch (error) {
              console.error("Failed to upsert user token", error);
            }
          }
        } else {
          console.log("[AuthContext] No user, setting profile to null");
          setProfile(null);
        }
        console.log("[AuthContext] setLoading(false) from onAuthStateChange");
        setLoading(false);
      }
    );

    const checkInitialSession = async () => {
      console.log("[AuthContext] checkInitialSession called");
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log("[AuthContext] Initial session:", session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log("[AuthContext] Initial user found, fetching profile...");
          const userProfile = await fetchUserProfile(session.user.id);
          console.log("[AuthContext] Initial profile result:", userProfile);
          setProfile(userProfile);
        }
      } catch (error) {
        console.error("[AuthContext] Error checking initial session:", error);
      }
      
      console.log("[AuthContext] setLoading(false) from checkInitialSession");
      setLoading(false);
    };
    
    checkInitialSession();

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

  console.log("[AuthContext] Rendering provider, loading:", loading, "user:", user?.id, "profile:", profile?.id);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
