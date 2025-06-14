
import { supabase } from '@/integrations/supabase/client';
import { Child } from '@/types';

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
