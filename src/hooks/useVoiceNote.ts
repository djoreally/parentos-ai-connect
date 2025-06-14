
import { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { uploadDocument } from '@/api/storage';
import { supabase } from '@/integrations/supabase/client';

export const useVoiceNote = (selectedChildId?: string) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [savedAudioUrl, setSavedAudioUrl] = useState<string | undefined>(undefined);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const resetAudio = useCallback(() => {
    setIsRecording(false);
    setRecordingTime(0);
    setAudioBlob(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setSavedAudioUrl(undefined);
    audioChunksRef.current = [];
    setIsPlaying(false);
    setTranscription(null);
  }, [audioUrl]);

  const handleDiscardAudio = useCallback(() => {
    resetAudio();
    toast.info("Recording discarded.");
  }, [resetAudio]);

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

  const handleTranscribe = useCallback(async (blob: Blob) => {
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
      
      const transcriptionResult = transcribeData.transcription;
      setTranscription(transcriptionResult || "Could not transcribe audio.");
      toast.success("Transcription complete! You can now edit before saving.");

    } catch (error) {
      console.error("Error during transcription:", error);
      toast.error((error as Error).message || "An error occurred during transcription.");
      setSavedAudioUrl(undefined);
    } finally {
      setIsTranscribing(false);
    }
  }, [selectedChildId]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.info("Recording stopped. Transcribing...");
    }
  }, [handleTranscribe]);

  const startRecording = useCallback(async () => {
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
  }, [selectedChildId, resetAudio, handleTranscribe]);

  const handleToggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, stopRecording, startRecording]);
  
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  return {
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
  };
};
