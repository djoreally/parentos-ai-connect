
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const signOutUser = async (): Promise<string | null> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out. Please try again.');
      return `Sign out failed: ${error.message}`;
    } else {
      toast.success('Signed out successfully');
      return null;
    }
  } catch (error: any) {
    console.error('Unexpected error during sign out:', error);
    toast.error('An unexpected error occurred during sign out');
    return `Unexpected error: ${error.message}`;
  }
};

export const getInitialSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error);
      return { session: null, error: `Session error: ${error.message}` };
    }

    return { session, error: null };
  } catch (error: any) {
    console.error('Session initialization error:', error);
    return { session: null, error: `Initialization error: ${error.message}` };
  }
};
