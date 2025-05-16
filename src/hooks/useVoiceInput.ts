import { useState, useEffect, useCallback } from 'react';
import { transcribeSpeech } from '../services/openai';

interface UseVoiceInputProps {
  onTranscriptionComplete: (text: string) => void;
}

export function useVoiceInput({ onTranscriptionComplete }: UseVoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize media recorder
  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          setRecordedChunks(prev => [...prev, e.data]);
        }
      };
      
      recorder.onstop = async () => {
        const audioBlob = new Blob(recordedChunks, { type: 'audio/webm' });
        
        try {
          setIsTranscribing(true);
          const transcription = await transcribeSpeech(audioBlob);
          onTranscriptionComplete(transcription);
        } catch (err) {
          setError('Failed to transcribe audio. Please try again.');
          console.error('Transcription error:', err);
        } finally {
          setIsTranscribing(false);
          setRecordedChunks([]);
        }
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      setError('Could not access microphone. Please check permissions.');
      console.error('Media recorder error:', err);
    }
  }, [onTranscriptionComplete, recordedChunks]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  }, [mediaRecorder, isRecording]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
      }
    };
  }, [mediaRecorder, isRecording]);

  return {
    isRecording,
    isTranscribing,
    error,
    startRecording,
    stopRecording
  };
}