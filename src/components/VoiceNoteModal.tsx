
import { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mic, Square, Save, Trash2, Loader2, Play, Pause } from 'lucide-react';
import { toast } from 'sonner';
import { submitLog } from '@/api/logs';
import { uploadDocument } from '@/api/storage';
import { supabase } from '@/integrations/supabase/client';

interface VoiceNoteModalProps {
  onOpenChange: (open: boolean) => void;
  selectedChildId?: string;
}

const VoiceNoteModal = ({ onOpenChange, selectedChildId }: VoiceNoteModalProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: submitLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logs', selectedChildId] });
      toast.success("Voice note saved & transcribed!");
      handleClose();
    },
    onError: (error) => {
      console.error("Failed to submit voice note:", error);
      toast.error("Failed to save voice note. Please try again.");
    },
    onSettled: () => {
      setIsTranscribing(false);
    }
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleClose = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setRecordingTime(0);
    setAudioBlob(null);
    if(audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    audioChunksRef.current = [];
    onOpenChange(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setAudioBlob(null);
      if(audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
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

  const handleSave = async () => {
    if (!selectedChildId || !audioBlob) {
      toast.error("No recording or child selected.");
      return;
    }

    setIsTranscribing(true);
    toast.info("Uploading and transcribing, please wait...");

    try {
      const audioFile = new File([audioBlob], `voice-note-${new Date().toISOString()}.webm`, { type: 'audio/webm' });
      const { publicUrl } = await uploadDocument(audioFile);

      const audioBase64 = await blobToBase64(audioBlob);
      const { data: transcribeData, error: transcribeError } = await supabase.functions.invoke('transcribe-audio', {
        body: { audio: audioBase64, mimeType: 'audio/webm' },
      });

      if (transcribeError || !transcribeData.transcription) {
        throw new Error(transcribeError?.message || "Transcription failed.");
      }
      
      const transcription = transcribeData.transcription;

      const title = `Voice Note - ${new Date().toLocaleString()}`;
      mutation.mutate({
        title,
        description: transcription || "Could not transcribe audio.",
        type: 'voice',
        childId: selectedChildId,
        audio_url: publicUrl
      });
    } catch (error) {
      console.error("Error during save process:", error);
      toast.error((error as Error).message || "An error occurred during save.");
      setIsTranscribing(false);
    }
  };
  
  const handleDiscard = () => {
    toast.warning("Recording discarded.");
    handleClose();
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

  const hasRecorded = !!audioBlob;

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Log a Voice Note</DialogTitle>
        <DialogDescription>
          Record your thoughts or observations. We'll transcribe it using AI and add it to the timeline.
        </DialogDescription>
      </DialogHeader>
      
      <div className="flex flex-col items-center justify-center space-y-4 py-8">
        {!hasRecorded ? (
          <>
            <Button
              size="icon"
              className={`w-24 h-24 rounded-full transition-all duration-300 ${isRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-primary'}`}
              onClick={handleToggleRecording}
            >
              {isRecording ? <Square size={48} /> : <Mic size={48} />}
            </Button>
            <p className="text-2xl font-mono">{formatTime(recordingTime)}</p>
            <p className="text-muted-foreground">{isRecording ? "Press to stop recording" : "Press to start recording"}</p>
          </>
        ) : (
          <div className="text-center space-y-4 w-full">
            <p className="text-lg font-semibold">Recording Complete</p>
            <div className="flex items-center justify-center gap-4 bg-muted p-2 rounded-lg w-full max-w-sm mx-auto">
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
             <p className="text-3xl font-mono">{formatTime(recordingTime)}</p>
            <p className="text-muted-foreground">Review your recording before saving.</p>
          </div>
        )}
      </div>

      <DialogFooter className="sm:justify-between">
        <Button variant="ghost" onClick={handleClose}>Cancel</Button>
        {hasRecorded && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDiscard} disabled={isTranscribing}>
              <Trash2 className="mr-2 h-4 w-4" />
              Discard
            </Button>
            <Button onClick={handleSave} disabled={isTranscribing || mutation.isPending}>
              {isTranscribing || mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save to Timeline
                </>
              )}
            </Button>
          </div>
        )}
      </DialogFooter>
    </DialogContent>
  );
};

export default VoiceNoteModal;
