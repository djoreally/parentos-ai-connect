
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { LogEntry } from '@/types';
import { submitLog } from '@/api/logs';
import { toast } from 'sonner';

interface NewLogFormProps {
  onAddLog: (log: LogEntry) => void;
}

const NewLogForm = ({ onAddLog }: NewLogFormProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const newLog = await submitLog({ title, description });
      onAddLog(newLog);
      toast.success("New event logged successfully!");
      setTitle('');
      setDescription('');
    } catch (error) {
      console.error("Failed to submit log:", error);
      toast.error("Failed to log event. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
            disabled={isSubmitting}
          />
          <Textarea
            placeholder="Describe what happened..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            disabled={isSubmitting}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting || !title || !description}>
            {isSubmitting ? (
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
