
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types';
import { sanitize } from '@/lib/sanitizer';

export const getMessages = async (childId: string): Promise<Message[]> => {
  const { data, error } = await supabase
    .from('messages')
    .select('*, profiles(first_name, last_name)')
    .eq('child_id', childId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
  // The 'as any' is a concession to Supabase's generated types not perfectly matching query results with joins
  return data as any as Message[];
};

export const sendMessage = async (childId: string, content: string): Promise<Message> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // Sanitize user-provided content to prevent XSS
    const sanitizedContent = sanitize(content);

    const { data, error } = await supabase
        .from('messages')
        .insert({ content: sanitizedContent, child_id: childId, user_id: user.id })
        .select()
        .single();

    if (error) {
        console.error('Error sending message:', error);
        throw error;
    }
    return data as Message;
};
