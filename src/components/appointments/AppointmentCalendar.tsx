
import { Calendar } from '@/components/ui/calendar';
import { AppointmentWithParticipants } from '@/api/appointments';
import { isSameDay } from 'date-fns';

interface AppointmentCalendarProps {
  appointments: AppointmentWithParticipants[];
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
}

const AppointmentCalendar = ({ appointments, selectedDate, onDateSelect }: AppointmentCalendarProps) => {
  const appointmentsByDay = appointments.reduce((acc, app) => {
    const date = new Date(app.start_time).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(app);
    return acc;
  }, {} as Record<string, AppointmentWithParticipants[]>);

  return (
    <Calendar
      mode="single"
      selected={selectedDate}
      onSelect={onDateSelect}
      className="rounded-md border"
      modifiers={{
        hasAppointment: (date) => {
          return !!appointmentsByDay[date.toDateString()];
        },
      }}
      modifiersStyles={{
        hasAppointment: {
          position: 'relative',
        },
      }}
      components={{
        DayContent: (props) => {
          const originalContent = <div className="relative">{props.date.getDate()}</div>;
          if (appointmentsByDay[props.date.toDateString()]) {
            return (
              <div className="relative">
                {originalContent}
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary" />
              </div>
            );
          }
          return originalContent;
        },
      }}
    />
  );
};

export default AppointmentCalendar;
