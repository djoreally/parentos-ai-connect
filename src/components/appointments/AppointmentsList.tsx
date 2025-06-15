
import { AppointmentWithParticipants } from '@/api/appointments';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Clock, MapPin, Users } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface AppointmentsListProps {
  appointments: AppointmentWithParticipants[];
  selectedDate: Date;
}

const AppointmentsList = ({ appointments, selectedDate }: AppointmentsListProps) => {
  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appointments for {format(selectedDate, 'PPP')}</CardTitle>
      </CardHeader>
      <CardContent>
        {appointments.length > 0 ? (
          <div className="space-y-4">
            {appointments.map((app) => (
              <div key={app.id} className="p-4 border rounded-lg">
                <h3 className="font-semibold">{app.title}</h3>
                <p className="text-sm text-muted-foreground">{app.description}</p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{format(new Date(app.start_time), 'p')} - {format(new Date(app.end_time), 'p')}</span>
                  </div>
                  {app.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{app.location}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2">
                   <Users className="h-4 w-4 text-muted-foreground" />
                   <div className="flex -space-x-2">
                    {app.participants.map(p => (
                      <Tooltip key={p.id}>
                        <TooltipTrigger>
                           <Avatar className="h-6 w-6 border-2 border-background">
                            <AvatarFallback>{getInitials(p.profile?.first_name, p.profile?.last_name)}</AvatarFallback>
                          </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{p.profile?.first_name} {p.profile?.last_name}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No appointments for this day.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default AppointmentsList;
