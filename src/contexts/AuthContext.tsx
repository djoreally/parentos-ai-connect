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

  useEffect(() => {
    console.log("[AuthContext] useEffect entered"); // DEBUG

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("[AuthContext] onAuthStateChange:", event, session); // DEBUG
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // fetch profile
          const { data: userProfile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
          if (error) {
            console.log("[AuthContext] profile fetch error:", error);
          }
          console.log("[AuthContext] profile loaded:", userProfile); // DEBUG
          setProfile(userProfile as Profile || null);

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
        console.log("[AuthContext] setLoading(false) from onAuthStateChange"); // DEBUG
        setLoading(false);
      }
    );

    const checkInitialSession = async () => {
      console.log("[AuthContext] checkInitialSession called"); // DEBUG
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data: userProfile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();
        if (error) {
          console.log("[AuthContext] profile fetch error (initial):", error);
        }
        console.log("[AuthContext] profile loaded (initial):", userProfile); // DEBUG
        setProfile(userProfile as Profile || null);
      }
      console.log("[AuthContext] setLoading(false) from checkInitialSession"); // DEBUG
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

  console.log("[AuthContext] Rendering provider, loading:", loading, "user:", user, "profile:", profile); // DEBUG

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
