
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { submitLog } from '@/api/logs';
import { toast } from 'sonner';

const NewLogForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: submitLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logs'] });
      toast.success("New event logged successfully!");
      setTitle('');
      setDescription('');
    },
    onError: (error) => {
      console.error("Failed to submit log:", error);
      toast.error("Failed to log event. Please try again.");
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || mutation.isPending) return;

    mutation.mutate({ title, description });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log a New Event</CardTitle>
        <CardDescription>
          What's happening? Log anything—a behavior, a feeling, a question for the doctor.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Title (e.g., 'Tummy ache after lunch')"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={mutation.isPending}
          />
          <Textarea
            placeholder="Describe what happened..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            disabled={mutation.isPending}
          />
          <Button type="submit" className="w-full" disabled={mutation.isPending || !title || !description}>
            {mutation.isPending ? (
              'Adding...'
            ) : (
              <>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add to Timeline
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default NewLogForm;
