import { supabase } from '@/integrations/supabase/client';
import { Child } from '@/types';
import { logAuditEvent } from './audit';

export const getChildren = async (): Promise<Child[]> => {
    const { data, error } = await supabase.from('children').select('*');

    if (error) {
        console.error('Error fetching children:', error);
        throw error;
    }
    return data || [];
}

export const getChildById = async (id: string): Promise<Child | null> => {
    const { data, error } = await supabase.from('children').select('*').eq('id', id).maybeSingle();

    if (error) {
        console.error('Error fetching child:', error);
        throw error;
    }
    return data;
}

export const createChild = async (childData: {
  name: string;
  dob: string;
  allergies: string[] | null;
  medications: string[] | null;
}): Promise<Child> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated for this action.");

  const { data, error } = await supabase
    .from('children')
    .insert({ ...childData, user_id: user.id })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating child:', error);
    throw error;
  }

  await logAuditEvent('CHILD_PROFILE_CREATED', {
    target_entity: 'child',
    target_id: data.id,
    details: { name: data.name, dob: data.dob }
  });

  return data;
};
