
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { PlusCircle, Mic, Square } from 'lucide-react';
import { submitLog } from '@/api/logs';
import { toast } from 'sonner';
import QuickLogTemplates from './QuickLogTemplates';
import VoiceNoteDisplay from './VoiceNoteDisplay';
import { useVoiceNote } from '@/hooks/useVoiceNote';

const NewLogForm = ({ selectedChildId }: { selectedChildId?: string }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  const queryClient = useQueryClient();

  const {
    isRecording,
    recordingTime,
    isTranscribing,
    audioUrl,
    isPlaying,
    handleToggleRecording,
    handleDiscardAudio,
    togglePlay,
    audioRef,
    setIsPlaying,
    transcription,
    savedAudioUrl,
    resetAudio,
  } = useVoiceNote(selectedChildId);

  useEffect(() => {
    if (transcription) {
      setTitle(`Voice Note - ${new Date().toLocaleDateString()}`);
      setDescription(transcription);
    }
  }, [transcription]);

  const mutation = useMutation({
    mutationFn: submitLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logs', selectedChildId] });
      toast.success("New event logged successfully!");
      setTitle('');
      setDescription('');
      resetAudio();
    },
    onError: (error) => {
      console.error("Failed to submit log:", JSON.stringify(error, null, 2));
      toast.error("Failed to log event. Please try again.");
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || mutation.isPending || !selectedChildId) return;
    mutation.mutate({ title, description, childId: selectedChildId, type: savedAudioUrl ? 'voice' : 'text', audio_url: savedAudioUrl });
  };
  
  const handleSelectTemplate = (template: { title: string, description: string }) => {
    setTitle(template.title);
    setDescription(template.description);
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
          <QuickLogTemplates onSelectTemplate={handleSelectTemplate} />
        
          <Input
            placeholder="Title (e.g., 'Tummy ache after lunch')"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={mutation.isPending || isTranscribing}
          />
          <div className="relative">
            <Textarea
              placeholder="Describe what happened... or tap the mic to record."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              disabled={mutation.isPending || isTranscribing}
              className="pr-12"
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="absolute bottom-2 right-2"
              onClick={handleToggleRecording}
              disabled={isTranscribing || mutation.isPending}
            >
              {isRecording ? <Square className="text-red-500" /> : <Mic />}
            </Button>
          </div>

          {(isRecording || isTranscribing || audioUrl) && (
            <VoiceNoteDisplay
              isRecording={isRecording}
              recordingTime={recordingTime}
              isTranscribing={isTranscribing}
              audioUrl={audioUrl}
              isPlaying={isPlaying}
              togglePlay={togglePlay}
              handleDiscardAudio={handleDiscardAudio}
              audioRef={audioRef}
              setIsPlaying={setIsPlaying}
              disabled={mutation.isPending}
            />
          )}
          
          <Button type="submit" className="w-full" disabled={mutation.isPending || isTranscribing || !title || !description || !selectedChildId}>
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
