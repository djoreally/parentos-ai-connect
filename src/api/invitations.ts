
import { supabase } from '@/integrations/supabase/client';
import { logAuditEvent } from './audit';

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

  // Fetch child and parent info in parallel for the email
  const [
    { data: childData, error: childError },
    { data: parentProfile, error: parentError }
  ] = await Promise.all([
    supabase.from('children').select('name').eq('id', childId).single(),
    supabase.from('profiles').select('first_name, last_name').eq('id', user.id).single()
  ]);

  if (childError || !childData) {
    console.error("Error fetching child's name:", childError);
    throw new Error("Could not find the child's details to send the invitation.");
  }
  
  if (parentError) {
    console.error("Error fetching parent's name:", parentError);
    // Non-critical, we can proceed without it.
  }

  const parentName = (parentProfile?.first_name && parentProfile?.last_name) 
    ? `${parentProfile.first_name} ${parentProfile.last_name}` 
    : 'A parent';


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
  
  const invitationLink = `${window.location.origin}/register?token=${token}`;

  // Invoke edge function to send email
  const { error: functionError } = await supabase.functions.invoke('send-invitation-email', {
    body: {
      invitee_email: email,
      invitation_link: invitationLink,
      child_name: childData.name,
      parent_name: parentName,
      role: role,
    },
  });

  if (functionError) {
    console.error('Error sending invitation email:', functionError);
    // We don't throw an error here because the invitation was successfully created in the database.
    // The user will still see a success message. We can add more robust UI feedback later.
  } else {
    console.log(`Successfully queued invitation email to ${email}`);
  }

  await logAuditEvent('TEAM_INVITATION_SENT', {
    target_entity: 'invitation',
    target_id: data.id,
    details: { childId, invited_email: email, role }
  });
  
  return data;
};
