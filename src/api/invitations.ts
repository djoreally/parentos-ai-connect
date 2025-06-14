
import { supabase } from '@/integrations/supabase/client';

export const createInvitation = async ({
  childId,
  email,
  role,
}: {
  childId: string;
  email: string;
  role: 'Teacher' | 'Doctor';
}) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('You must be logged in to send invitations.');
  }

  const token = crypto.randomUUID();

  const { data, error } = await supabase
    .from('invitations')
    .insert({
      parent_user_id: user.id,
      child_id: childId,
      invitee_email: email,
      role: role,
      token: token,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating invitation:', error);
    // Provide a more user-friendly error
    if (error.code === '23505') { // unique_violation
        throw new Error('An invitation for this email and child already exists.');
    }
    throw new Error('Failed to create invitation. Please try again.');
  }
  
  // In a real application, you would use an Edge Function to email this link.
  // For now, we'll log it to the console for demonstration and testing purposes.
  const invitationLink = `${window.location.origin}/register?token=${token}`;
  console.log(`Generated invitation link for ${email}: ${invitationLink}`);
  
  return data;
};
