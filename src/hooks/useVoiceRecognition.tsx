
import { useState, useEffect, useCallback } from 'react';

// Define the interface for SpeechRecognition
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: ((event: Event) => void) | null;
}

// Add global type declarations
declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

interface UseVoiceRecognitionOptions {
  onResult?: (text: string) => void;
  onEnd?: () => void;
  lang?: string;
}

export const useVoiceRecognition = (options: UseVoiceRecognitionOptions = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // SpeechRecognition setup
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  useEffect(() => {
    if (!recognition) {
      setError('Speech recognition is not supported in this browser.');
      setHasPermission(false);
      return;
    }

    // Check for microphone permission
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => {
        setHasPermission(true);
        setError(null);
      })
      .catch(() => {
        setHasPermission(false);
        setError('Microphone access denied');
      });
  }, [recognition]);

  useEffect(() => {
    if (!recognition) return;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = options.lang || 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join(' ');

      setTranscript(transcript);
      if (options.onResult) {
        options.onResult(transcript);
      }
    };

    recognition.onerror = (event: Event) => {
      console.error('Speech recognition error', event);
      setError('Error in speech recognition');
    };

    recognition.onend = () => {
      setIsListening(false);
      if (options.onEnd) {
        options.onEnd();
      }
    };
  }, [recognition, options]);

  const startListening = useCallback(() => {
    if (!recognition || !hasPermission) return;

    setError(null);
    setTranscript('');
    recognition.start();
    setIsListening(true);
  }, [recognition, hasPermission]);

  const stopListening = useCallback(() => {
    if (!recognition) return;

    recognition.stop();
    setIsListening(false);
  }, [recognition]);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    hasPermission,
    error
  };
};
