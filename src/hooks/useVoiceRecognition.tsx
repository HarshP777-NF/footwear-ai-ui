
import { useState, useEffect, useCallback } from 'react';

interface VoiceRecognitionProps {
  onResult?: (transcript: string) => void;
  onEnd?: () => void;
  language?: string;
}

interface VoiceRecognition {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  hasPermission: boolean | null;
  error: string | null;
}

// This is a type for the SpeechRecognition API which isn't fully typed in TypeScript
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

// This is a simple polyfill check for the various browser implementations
const SpeechRecognition = 
  window.SpeechRecognition ||
  window.webkitSpeechRecognition ||
  (window as any).mozSpeechRecognition ||
  (window as any).msSpeechRecognition;

export const useVoiceRecognition = ({
  onResult,
  onEnd,
  language = 'en-US'
}: VoiceRecognitionProps = {}): VoiceRecognition => {
  const [recognition, setRecognition] = useState<any>(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize the recognition object
  useEffect(() => {
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = language;

      setRecognition(recognitionInstance);
    } else {
      setError('Speech recognition is not supported in this browser');
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [language]);

  // Set up event listeners for the recognition object
  useEffect(() => {
    if (!recognition) return;

    const handleResult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      
      setTranscript(transcript);
      if (onResult) onResult(transcript);
    };

    const handleEnd = () => {
      setIsListening(false);
      if (onEnd) onEnd();
    };

    const handleError = (event: Event) => {
      if ((event as any).error === 'not-allowed') {
        setHasPermission(false);
        setError('Microphone permission denied');
      } else {
        setError(`Speech recognition error: ${(event as any).error || 'unknown error'}`);
      }
      setIsListening(false);
    };

    recognition.onresult = handleResult;
    recognition.onend = handleEnd;
    recognition.onerror = handleError;

    return () => {
      recognition.onresult = null;
      recognition.onend = null;
      recognition.onerror = null;
    };
  }, [recognition, onResult, onEnd]);

  // Check for microphone permission
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const result = await navigator.permissions.query({ name: 'microphone' as any });
        setHasPermission(result.state === 'granted');
        
        result.onchange = () => {
          setHasPermission(result.state === 'granted');
        };
      } catch (error) {
        // Browser might not support permissions API for microphone
        // In that case we'll find out when we try to start listening
        setHasPermission(null);
      }
    };

    checkPermission();
  }, []);

  const startListening = useCallback(() => {
    setError(null);
    if (!recognition) {
      setError('Speech recognition is not supported');
      return;
    }

    try {
      recognition.start();
      setIsListening(true);
      setTranscript('');
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setError('Failed to start speech recognition');
      setIsListening(false);
    }
  }, [recognition]);

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition, isListening]);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    hasPermission,
    error
  };
};
