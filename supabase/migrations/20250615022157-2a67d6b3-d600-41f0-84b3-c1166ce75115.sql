
-- Create custom types for appointment status, meeting type, and participant status
CREATE TYPE public.appointment_status AS ENUM ('scheduled', 'cancelled', 'completed');
CREATE TYPE public.meeting_type AS ENUM ('online', 'in-person');
CREATE TYPE public.participant_status AS ENUM ('pending', 'accepted', 'declined', 'tentative');

-- Create the main 'appointments' table
CREATE TABLE public.appointments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    organizer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status public.appointment_status NOT NULL DEFAULT 'scheduled',
    meeting_type public.meeting_type NOT NULL,
    location TEXT,
    google_meet_link TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT end_time_after_start_time CHECK (end_time > start_time)
);

-- Create the 'appointment_participants' table to link users to appointments
CREATE TABLE public.appointment_participants (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status public.participant_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(appointment_id, user_id)
);

-- Enable Row Level Security (RLS) on both tables
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for 'appointments'
CREATE POLICY "Users can view appointments for children they have access to"
ON public.appointments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.child_access ca
    WHERE ca.child_id = appointments.child_id AND ca.user_id = auth.uid()
  )
);

CREATE POLICY "Organizers can create appointments for their children"
ON public.appointments FOR INSERT WITH CHECK (
  organizer_user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.child_access ca
    WHERE ca.child_id = appointments.child_id AND ca.user_id = auth.uid()
  )
);

CREATE POLICY "Organizers can update their own appointments"
ON public.appointments FOR UPDATE USING (organizer_user_id = auth.uid());

CREATE POLICY "Organizers can delete their own appointments"
ON public.appointments FOR DELETE USING (organizer_user_id = auth.uid());


-- RLS Policies for 'appointment_participants'
CREATE POLICY "Users can view participants of accessible appointments"
ON public.appointment_participants FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.appointments a
    WHERE a.id = appointment_participants.appointment_id AND (
      EXISTS (
        SELECT 1 FROM public.child_access ca
        WHERE ca.child_id = a.child_id AND ca.user_id = auth.uid()
      )
    )
  )
);

CREATE POLICY "Organizers can manage participants"
ON public.appointment_participants FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.appointments a
    WHERE a.id = appointment_participants.appointment_id AND a.organizer_user_id = auth.uid()
  )
);

CREATE POLICY "Participants can update their own status"
ON public.appointment_participants FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Database function to automatically add the appointment organizer as a participant
CREATE OR REPLACE FUNCTION public.add_organizer_as_participant()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.appointment_participants (appointment_id, user_id, status)
  VALUES (NEW.id, NEW.organizer_user_id, 'accepted');
  RETURN NEW;
END;
$$;

-- Trigger to execute the function after a new appointment is created
CREATE TRIGGER on_appointment_created_add_organizer
AFTER INSERT ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.add_organizer_as_participant();
