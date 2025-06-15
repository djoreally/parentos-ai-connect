import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { createAppointment, getCareTeamForChild, CareTeamMember } from '@/api/appointments';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { CalendarIcon, Plus, UserPlus, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const appointmentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  date: z.date({ required_error: 'Date is required' }),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  meetingType: z.enum(['online', 'in-person']),
  location: z.string().optional(),
  participantIds: z.array(z.string()),
}).refine(data => {
    // Basic time format validation, e.g., "14:30"
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(data.startTime) || !timeRegex.test(data.endTime)) return false;
    
    const [startHour, startMinute] = data.startTime.split(':').map(Number);
    const [endHour, endMinute] = data.endTime.split(':').map(Number);
    
    if (endHour < startHour || (endHour === startHour && endMinute <= startMinute)) {
        return false;
    }
    return true;
}, {
    message: "End time must be after start time",
    path: ["endTime"],
});

interface CreateAppointmentDialogProps {
  childId: string;
}

const timeSlots = Array.from({ length: 48 }, (_, i) => {
    const hours = Math.floor(i / 2);
    const minutes = (i % 2) * 30;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
});

const CreateAppointmentDialog = ({ childId }: CreateAppointmentDialogProps) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof appointmentSchema>>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      title: '',
      description: '',
      meetingType: 'online',
      location: '',
      participantIds: [],
    },
  });

  const { data: careTeam } = useQuery({
    queryKey: ['careTeam', childId],
    queryFn: () => getCareTeamForChild(childId),
    enabled: !!childId,
  });

  const mutation = useMutation({
    mutationFn: (values: z.infer<typeof appointmentSchema>) => {
      const [startHour, startMinute] = values.startTime.split(':').map(Number);
      const startDateTime = new Date(values.date);
      startDateTime.setHours(startHour, startMinute);

      const [endHour, endMinute] = values.endTime.split(':').map(Number);
      const endDateTime = new Date(values.date);
      endDateTime.setHours(endHour, endMinute);

      const appointmentData = {
        child_id: childId,
        organizer_user_id: '', // This will be set by RLS from the session
        title: values.title,
        description: values.description,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        meeting_type: values.meetingType,
        location: values.location,
      };
      
      return createAppointment(appointmentData, values.participantIds);
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Appointment created successfully.' });
      queryClient.invalidateQueries({ queryKey: ['appointments', childId] });
      setOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Error', description: `Failed to create appointment: ${error.message}` });
    },
  });

  const onSubmit = (values: z.infer<typeof appointmentSchema>) => {
    mutation.mutate(values);
  };
  
  const [selectedParticipants, setSelectedParticipants] = useState<CareTeamMember[]>([]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Schedule Appointment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Schedule New Appointment</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Monthly Check-in" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a time" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {timeSlots.map(time => <SelectItem key={time} value={time}>{time}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>End Time</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a time" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {timeSlots.map(time => <SelectItem key={time} value={time}>{time}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
                />
            </div>
             <FormField
              control={form.control}
              name="participantIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invite Participants</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start">
                                <UserPlus className="mr-2 h-4 w-4" />
                                Select participants
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                                <CommandInput placeholder="Search team members..." />
                                <CommandEmpty>No team members found.</CommandEmpty>
                                <CommandGroup>
                                    {careTeam?.map((member) => (
                                        <CommandItem
                                            key={member.id}
                                            onSelect={() => {
                                                const currentIds = field.value || [];
                                                const newIds = currentIds.includes(member.id)
                                                    ? currentIds.filter(id => id !== member.id)
                                                    : [...currentIds, member.id];
                                                field.onChange(newIds);
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                "mr-2 h-4 w-4",
                                                (field.value || []).includes(member.id) ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {member.first_name} {member.last_name} ({member.role})
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </Command>
                        </PopoverContent>
                    </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
                <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending ? 'Scheduling...' : 'Schedule Appointment'}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAppointmentDialog;
