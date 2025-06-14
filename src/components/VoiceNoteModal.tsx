import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mic, Square, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { submitLog } from '@/api/logs';

interface VoiceNoteModalProps {
  onOpenChange: (open: boolean) => void;
}

const VoiceNoteModal = ({ onOpenChange }: VoiceNoteModalProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecorded, setHasRecorded] = useState(false);
  
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: submitLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logs'] });
      toast.success("Voice note saved & interpreted for others!");
      handleClose();
    },
    onError: (error) => {
      console.error("Failed to submit voice note:", error);
      toast.error("Failed to save voice note. Please try again.");
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
    setIsRecording(false);
    setRecordingTime(0);
    setHasRecorded(false);
    onOpenChange(false);
  };
  
  const handleToggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setHasRecorded(true);
    } else {
      setRecordingTime(0);
      setHasRecorded(false);
      setIsRecording(true);
      toast.info("Recording started...");
    }
  };

  const handleSave = () => {
    const title = `Voice Note - ${new Date().toLocaleString()}`;
    const description = `A voice note was recorded for ${recordingTime} seconds. The transcript would contain keywords like 'sad' or 'happy tummy'.`;
    mutation.mutate({ title, description, type: 'voice' });
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

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Log a Voice Note</DialogTitle>
        <DialogDescription>
          Record your thoughts or observations. We'll simulate transcribing it and add it to the timeline.
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
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold">Recording Complete</p>
            <p className="text-3xl font-mono">{formatTime(recordingTime)}</p>
            <p className="text-muted-foreground">Ready to save to timeline.</p>
          </div>
        )}
      </div>

      <DialogFooter className="sm:justify-between">
        <Button variant="ghost" onClick={handleClose}>Cancel</Button>
        {hasRecorded && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDiscard}>
              <Trash2 className="mr-2 h-4 w-4" />
              Discard
            </Button>
            <Button onClick={handleSave} disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : (
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
