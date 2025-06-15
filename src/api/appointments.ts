
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export type AppointmentWithParticipants = Tables<'appointments'> & {
  participants: (Tables<'appointment_participants'> & {
    profile: Pick<Tables<'profiles'>, 'first_name' | 'last_name' | 'id'> | null;
  })[];
};

export type CareTeamMember = Pick<Tables<'profiles'>, 'id' | 'first_name' | 'last_name' | 'role'>;


export const getAppointmentsForChild = async (childId: string): Promise<AppointmentWithParticipants[]> => {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      participants:appointment_participants!inner (
        *,
        profile:profiles!inner (id, first_name, last_name)
      )
    `)
    .eq('child_id', childId)
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching appointments:', error);
    throw error;
  }

  // The type from select is a bit complex, we cast it here after checking structure.
  return data as unknown as AppointmentWithParticipants[];
};

export const getCareTeamForChild = async (childId: string): Promise<CareTeamMember[]> => {
    const { data, error } = await supabase
        .from('child_access')
        .select(`
            profiles:profiles!inner(id, first_name, last_name, role)
        `)
        .eq('child_id', childId);

    if (error) {
        console.error('Error fetching care team:', error);
        throw error;
    }
    
    // We need to filter out null profiles and flatten the structure.
    return data
      .map(item => item.profiles)
      .filter((p): p is CareTeamMember => p !== null);
};

export const createAppointment = async (
  appointmentData: Omit<Tables<'appointments'>, 'id' | 'created_at' | 'google_meet_link' | 'status'>,
  participantIds: string[]
): Promise<Tables<'appointments'>> => {
  const { data: appointment, error: appointmentError } = await supabase
    .from('appointments')
    .insert(appointmentData)
    .select()
    .single();

  if (appointmentError) {
    console.error('Error creating appointment:', appointmentError);
    throw appointmentError;
  }
  
  if (appointment && participantIds.length > 0) {
    const participantsToInsert = participantIds.map(userId => ({
      appointment_id: appointment.id,
      user_id: userId,
      status: 'pending' as const,
    }));

    const { error: participantsError } = await supabase
      .from('appointment_participants')
      .insert(participantsToInsert);

    if (participantsError) {
      console.error('Error adding participants:', participantsError);
      // Potentially delete the created appointment for consistency
      await supabase.from('appointments').delete().eq('id', appointment.id);
      throw participantsError;
    }
  }

  return appointment;
};
