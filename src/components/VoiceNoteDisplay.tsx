
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Play, Pause, Trash2 } from 'lucide-react';

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};

interface VoiceNoteDisplayProps {
  isRecording: boolean;
  recordingTime: number;
  isTranscribing: boolean;
  audioUrl: string | null;
  isPlaying: boolean;
  togglePlay: () => void;
  handleDiscardAudio: () => void;
  audioRef: React.RefObject<HTMLAudioElement>;
  setIsPlaying: (isPlaying: boolean) => void;
  disabled: boolean;
}

const VoiceNoteDisplay = ({
  isRecording,
  recordingTime,
  isTranscribing,
  audioUrl,
  isPlaying,
  togglePlay,
  handleDiscardAudio,
  audioRef,
  setIsPlaying,
  disabled,
}: VoiceNoteDisplayProps) => {
  return (
    <div className="p-2 border rounded-lg space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isRecording && <p className="text-sm font-mono text-red-500 animate-pulse">{formatTime(recordingTime)}</p>}
          {isTranscribing && <Loader2 className="h-4 w-4 animate-spin" />}
          {isTranscribing && <p className="text-sm text-muted-foreground">Transcribing...</p>}
        </div>
        {audioUrl && (
          <Button size="icon" variant="ghost" onClick={handleDiscardAudio} disabled={isTranscribing || disabled}>
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
  );
};

export default VoiceNoteDisplay;
