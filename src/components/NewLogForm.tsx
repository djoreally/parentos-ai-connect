
import { useState, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Mic, Square, Loader2, Play, Pause, Trash2 } from 'lucide-react';
import { submitLog } from '@/api/logs';
import { toast } from 'sonner';
import { uploadDocument } from '@/api/storage';
import { supabase } from '@/integrations/supabase/client';

const quickLogTemplates = [
  { title: "Had a great day", description: "Today was a positive day. Some highlights include: " },
  { title: "Feeling sick", description: "Symptoms: \nTime: \nActions taken: " },
  { title: "Behavioral issue", description: "Behavior observed: \nContext/Trigger: \nResponse/Outcome: " },
];

const NewLogForm = ({ selectedChildId }: { selectedChildId?: string }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Voice note state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null); // For player
  const [savedAudioUrl, setSavedAudioUrl] = useState<string | undefined>(undefined); // For submission
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const queryClient = useQueryClient();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const mutation = useMutation({
    mutationFn: submitLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logs', selectedChildId] });
      toast.success("New event logged successfully!");
      // Reset form
      setTitle('');
      setDescription('');
      handleDiscardAudio();
    },
    onError: (error) => {
      console.error("Failed to submit log:", JSON.stringify(error, null, 2));
      toast.error("Failed to log event. Please try again.");
    }
  });

  const resetAudio = () => {
    setIsRecording(false);
    setRecordingTime(0);
    setAudioBlob(null);
    if(audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setSavedAudioUrl(undefined);
    audioChunksRef.current = [];
    setIsPlaying(false);
  };
  
  const handleDiscardAudio = () => {
    resetAudio();
    toast.info("Recording discarded.");
  };

  const startRecording = async () => {
    if (!selectedChildId) {
        toast.error("Please select a child before recording.");
        return;
    }
    resetAudio();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => { audioChunksRef.current.push(event.data); };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
        handleTranscribe(blob);
      };

      recorder.start();
      setIsRecording(true);
      toast.info("Recording started...");
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.info("Recording stopped. Transcribing...");
    }
  };
  
  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };
  
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleTranscribe = async (blob: Blob) => {
    if (!selectedChildId) return;

    setIsTranscribing(true);
    try {
      const audioFile = new File([blob], `voice-note-${new Date().toISOString()}.webm`, { type: 'audio/webm' });
      const { publicUrl } = await uploadDocument(audioFile);
      setSavedAudioUrl(publicUrl);

      const audioBase64 = await blobToBase64(blob);
      const { data: transcribeData, error: transcribeError } = await supabase.functions.invoke('transcribe-audio', {
        body: { audio: audioBase64, mimeType: 'audio/webm' },
      });

      if (transcribeError || !transcribeData.transcription) {
        throw new Error(transcribeError?.message || "Transcription failed.");
      }
      
      const transcription = transcribeData.transcription;
      setTitle(`Voice Note - ${new Date().toLocaleDateString()}`);
      setDescription(transcription || "Could not transcribe audio.");
      toast.success("Transcription complete! You can now edit before saving.");

    } catch (error) {
      console.error("Error during transcription:", error);
      toast.error((error as Error).message || "An error occurred during transcription.");
      setSavedAudioUrl(undefined);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || mutation.isPending || !selectedChildId) return;
    mutation.mutate({ title, description, childId: selectedChildId, type: savedAudioUrl ? 'voice' : 'text', audio_url: savedAudioUrl });
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
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
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Quick Templates</p>
            <div className="flex flex-wrap gap-2">
              {quickLogTemplates.map((template) => (
                <Badge
                  key={template.title}
                  variant="outline"
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => handleSelectTemplate(template)}
                >
                  {template.title}
                </Badge>
              ))}
            </div>
          </div>
        
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
            <div className="p-2 border rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isRecording && <p className="text-sm font-mono text-red-500 animate-pulse">{formatTime(recordingTime)}</p>}
                  {isTranscribing && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isTranscribing && <p className="text-sm text-muted-foreground">Transcribing...</p>}
                </div>
                {audioUrl && (
                   <Button size="icon" variant="ghost" onClick={handleDiscardAudio} disabled={isTranscribing || mutation.isPending}>
                      <Trash2 className="h-4 w-4" />
                   </Button>
                )}
              </div>

              {audioUrl && !isTranscribing && (
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="ghost" onClick={togglePlay}>
                    {isPlaying ? <Pause /> : <Play />}
                  </Button>
                  <audio
                    ref={audioRef}
                    src={audioUrl ?? ''}
                    onEnded={() => setIsPlaying(false)}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    className="w-full"
                  />
                </div>
              )}
            </div>
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
