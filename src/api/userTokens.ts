
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert } from '@/integrations/supabase/types';
import { Session } from '@supabase/supabase-js';

export const getGoogleToken = async (): Promise<Tables<'user_tokens'> | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('user_tokens')
    .select('*')
    .eq('user_id', user.id)
    .eq('provider', 'google')
    .maybeSingle();

  if (error) {
    console.error('Error fetching google token', error);
    throw error;
  }

  return data;
};

export const upsertUserToken = async (session: Session) => {
    if (!session.user || !session.provider_token) {
        console.log("No provider token or user in session, skipping token upsert");
        return;
    }

    const provider = session.user.app_metadata.provider;
    if (provider !== 'google') {
        console.log(`Provider is ${provider}, not 'google'. Skipping token upsert.`);
        return;
    }

    const tokenData: Omit<TablesInsert<'user_tokens'>, 'id' | 'created_at' | 'updated_at'> & {user_id: string; provider: string} = {
        user_id: session.user.id,
        provider: provider,
        access_token: session.provider_token,
        refresh_token: session.provider_refresh_token ?? null,
        expires_at: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
        scopes: null, 
    };

    const { error } = await supabase
        .from('user_tokens')
        .upsert(tokenData, { onConflict: 'user_id,provider' });
    
    if (error) {
        console.error('Error upserting user token:', error);
        throw error;
    }

    console.log('User token for Google upserted successfully');
};
