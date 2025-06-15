
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAppointmentsForChild } from '@/api/appointments';
import AppointmentCalendar from '@/components/appointments/AppointmentCalendar';
import AppointmentsList from '@/components/appointments/AppointmentsList';
import CreateAppointmentDialog from '@/components/appointments/CreateAppointmentDialog';
import Header from '@/components/Header';
import ChildSelector from '@/components/ChildSelector';
import { useAuth } from '@/contexts/AuthContext';
import { isSameDay, parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

const AppointmentsPage = () => {
  const { user, children } = useAuth();
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    if (children && children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId]);

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments', selectedChildId],
    queryFn: () => getAppointmentsForChild(selectedChildId!),
    enabled: !!selectedChildId,
  });

  const appointmentsForSelectedDate = appointments?.filter(app => 
    isSameDay(parseISO(app.start_time), selectedDate || new Date())
  ) || [];

  const handleSelectChild = (childId: string) => {
    setSelectedChildId(childId);
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      <main className="flex-1 overflow-hidden p-4 md:p-6">
        <div className="flex flex-col md:flex-row gap-4 items-start mb-6">
           <div className="flex-1">
             <h1 className="text-2xl font-bold tracking-tight">Appointments</h1>
             <p className="text-muted-foreground">Schedule and manage appointments for your child's care team.</p>
           </div>
           <div className="flex items-center gap-4">
            {children && children.length > 0 && selectedChildId ? (
                <ChildSelector 
                    children={children}
                    selectedChildId={selectedChildId}
                    onSelectChild={handleSelectChild}
                />
            ) : null }
            {selectedChildId && <CreateAppointmentDialog childId={selectedChildId} />}
           </div>
        </div>
        
        {isLoading && selectedChildId && (
            <div className="grid md:grid-cols-3 gap-6">
                <Skeleton className="rounded-md border h-[360px]" />
                <div className="md:col-span-2 space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            </div>
        )}

        {selectedChildId && !isLoading && (
            <div className="grid md:grid-cols-3 gap-6">
                <AppointmentCalendar 
                    appointments={appointments || []} 
                    selectedDate={selectedDate}
                    onDateSelect={setSelectedDate}
                />
                <div className="md:col-span-2">
                    {selectedDate && <AppointmentsList appointments={appointmentsForSelectedDate} selectedDate={selectedDate} />}
                </div>
            </div>
        )}

        {!selectedChildId && !isLoading && (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-250px)] text-center p-8 border rounded-lg">
                <h2 className="text-xl font-semibold">Select a child</h2>
                <p className="text-muted-foreground mt-2">Please select a child from the dropdown to view and manage their appointments.</p>
            </div>
        )}
      </main>
    </div>
  );
};

export default AppointmentsPage;
