
import { ComingSoon } from '@/components/ComingSoon';

interface AppointmentCalendarProps {
  appointments: any[];
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
}

const AppointmentCalendar = ({ appointments, selectedDate, onDateSelect }: AppointmentCalendarProps) => {
  return <ComingSoon feature="Appointment Calendar" />;
};

export default AppointmentCalendar;
