
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types';
import { AuthContextType, AuthState } from '@/types/auth';
import { useProfileManager } from '@/hooks/useProfileManager';
import { signOutUser, getInitialSession, refreshSession } from '@/utils/authSession';
import { handleSecurityError } from '@/utils/errorHandler';
import { SECURITY_CONFIG } from '@/utils/security';

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
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    error: null,
    initialLoadComplete: false,
  });

  const { fetchOrCreateProfile, updateProfile, profileError, setProfileError } = useProfileManager();

  const updateAuthState = (updates: Partial<AuthState>) => {
    setAuthState(prev => ({ ...prev, ...updates }));
  };

  const refreshProfile = async () => {
    if (!authState.session?.user) return;
    
    try {
      setProfileError(null);
      const userProfile = await fetchOrCreateProfile(authState.session.user.id);
      updateAuthState({ profile: userProfile });
    } catch (error: any) {
      console.error('Error refreshing profile:', error);
      handleSecurityError(error, false);
      updateAuthState({ error: 'Failed to refresh profile' });
    }
  };

  const signOut = async () => {
    const error = await signOutUser();
    if (error) {
      updateAuthState({ error });
    }
  };

  // Auto-refresh session before expiration
  useEffect(() => {
    if (!authState.session) return;

    const expiresAt = authState.session.expires_at;
    if (!expiresAt) return;

    const expirationTime = expiresAt * 1000; // Convert to milliseconds
    const refreshTime = expirationTime - SECURITY_CONFIG.SESSION.REFRESH_THRESHOLD;
    const timeUntilRefresh = refreshTime - Date.now();

    if (timeUntilRefresh > 0) {
      const refreshTimer = setTimeout(async () => {
        try {
          const { session, error } = await refreshSession();
          if (error) {
            console.error('Auto-refresh failed:', error);
            await signOut();
          } else if (session) {
            updateAuthState({ session, user: session.user });
          }
        } catch (error) {
          console.error('Auto-refresh error:', error);
          await signOut();
        }
      }, timeUntilRefresh);

      return () => clearTimeout(refreshTimer);
    }
  }, [authState.session]);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const initializeAuth = async () => {
      const { session, error } = await getInitialSession();
      
      if (error) {
        if (mounted) {
          updateAuthState({ 
            error, 
            loading: false, 
            initialLoadComplete: true 
          });
        }
        return;
      }

      if (session && mounted) {
        updateAuthState({ 
          session, 
          user: session.user 
        });
        
        const userProfile = await fetchOrCreateProfile(session.user.id);
        if (mounted) {
          updateAuthState({ 
            profile: userProfile,
            loading: false,
            initialLoadComplete: true
          });
        }
      } else if (mounted) {
        updateAuthState({ 
          loading: false, 
          initialLoadComplete: true 
        });
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, session?.user?.email);
        
        if (!mounted) return;

        try {
          // Only show loading for subsequent auth changes after initial load
          if (authState.initialLoadComplete) {
            updateAuthState({ loading: true, error: null });
          }

          updateAuthState({ 
            session, 
            user: session?.user ?? null 
          });

          if (session?.user) {
            const userProfile = await fetchOrCreateProfile(session.user.id);
            if (mounted) {
              updateAuthState({ profile: userProfile });
            }
          } else {
            updateAuthState({ profile: null });
          }
        } catch (error: any) {
          console.error('Auth state change error:', error);
          handleSecurityError(error, false);
          updateAuthState({ error: 'Authentication error occurred' });
        } finally {
          if (mounted) {
            updateAuthState({ loading: false });
          }
        }
      }
    );

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [authState.initialLoadComplete]);

  // Update error state when profile error changes
  useEffect(() => {
    if (profileError) {
      updateAuthState({ error: profileError });
    }
  }, [profileError]);

  // Clear error after some time
  useEffect(() => {
    if (authState.error) {
      const timer = setTimeout(() => {
        updateAuthState({ error: null });
      }, 10000); // Clear error after 10 seconds

      return () => clearTimeout(timer);
    }
  }, [authState.error]);

  const value: AuthContextType = {
    user: authState.user,
    profile: authState.profile,
    session: authState.session,
    loading: authState.loading,
    error: authState.error,
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
