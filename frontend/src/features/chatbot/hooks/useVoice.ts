import { useState, useCallback, useRef, useEffect } from 'react';
import axios from '../../../app/axios';

interface UseVoiceOptions {
  onTranscript?: (text: string) => void;
  onError?: (error: string) => void;
  // Time in ms to wait after user stops speaking before sending (default: 1500ms)
  silenceTimeout?: number;
}

interface UseVoiceReturn {
  // Speech-to-Text (STT)
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  transcript: string;
  sttSupported: boolean;

  // Text-to-Speech (TTS)
  isSpeaking: boolean;
  speak: (text: string) => Promise<void>;
  stopSpeaking: () => void;
  ttsAvailable: boolean;
  serverTtsAvailable: boolean;
}

// Cache server TTS failure in localStorage
const SERVER_TTS_FAILURE_KEY = 'tts_server_failed';
const SERVER_TTS_FAILURE_DURATION = 5 * 60 * 1000; // 5 minutes

const getServerFailureCache = (): boolean => {
  try {
    const cached = localStorage.getItem(SERVER_TTS_FAILURE_KEY);
    if (!cached) return false;

    const { timestamp } = JSON.parse(cached);
    const age = Date.now() - timestamp;

    // If failure was recent (within 5 minutes), consider server unavailable
    return age < SERVER_TTS_FAILURE_DURATION;
  } catch {
    return false;
  }
};

const setServerFailureCache = () => {
  try {
    localStorage.setItem(
      SERVER_TTS_FAILURE_KEY,
      JSON.stringify({ timestamp: Date.now() })
    );
  } catch (error) {
    console.error('Failed to cache TTS server failure:', error);
  }
};

const clearServerFailureCache = () => {
  try {
    localStorage.removeItem(SERVER_TTS_FAILURE_KEY);
  } catch (error) {
    console.error('Failed to clear TTS server failure cache:', error);
  }
};

export function useVoice(options: UseVoiceOptions = {}): UseVoiceReturn {
  const { onTranscript, onError, silenceTimeout = 1500 } = options;

  // STT State
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [sttSupported, setSttSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Silence detection - wait for user to finish speaking
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const finalTranscriptRef = useRef<string>('');
  const isProcessingRef = useRef<boolean>(false);

  // TTS State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [serverTtsAvailable, setServerTtsAvailable] = useState(false);
  const [browserTtsAvailable, setBrowserTtsAvailable] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ttsAvailable = serverTtsAvailable || browserTtsAvailable;

  // Check browser support for Web Speech API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSttSupported(!!SpeechRecognition);

    const hasSpeechSynthesis =
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      typeof SpeechSynthesisUtterance !== 'undefined';
    setBrowserTtsAvailable(hasSpeechSynthesis);

    // Check TTS availability from backend
    checkTtsStatus();
  }, []);

  const checkTtsStatus = async () => {
    // If server recently failed, don't bother checking
    if (getServerFailureCache()) {
      console.log('TTS: Server marked as failed recently, skipping check');
      setServerTtsAvailable(false);
      return;
    }

    try {
      const response = await axios.get('/chatbot/tts/status');
      const available = !!response.data.available;
      setServerTtsAvailable(available);

      // If server is back online, clear failure cache
      if (available) {
        clearServerFailureCache();
      }
    } catch {
      console.log('TTS: Server status check failed');
      setServerTtsAvailable(false);
      setServerFailureCache();
    }
  };

  // Clear silence timer
  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  // Process final transcript after silence
  const processTranscript = useCallback((text: string) => {
    if (isProcessingRef.current || !text.trim()) return;

    isProcessingRef.current = true;
    clearSilenceTimer();

    console.log('Voice: User finished speaking. Transcript:', text);

    // Stop recognition before sending
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    setIsListening(false);
    onTranscript?.(text.trim());

    // Reset for next input
    setTimeout(() => {
      isProcessingRef.current = false;
      finalTranscriptRef.current = '';
    }, 100);
  }, [onTranscript, clearSilenceTimer]);

  // Stop speaking - MUST be defined before startListening which uses it
  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  const speakWithBrowser = useCallback((text: string): boolean => {
    if (
      !browserTtsAvailable ||
      typeof window === 'undefined' ||
      !('speechSynthesis' in window) ||
      typeof SpeechSynthesisUtterance === 'undefined'
    ) {
      console.log('Browser TTS not available');
      return false;
    }

    try {
      const synthesis = window.speechSynthesis;

      // Cancel any ongoing speech and wait a bit before starting new speech
      if (synthesis.speaking || synthesis.pending) {
        synthesis.cancel();
        // Small delay to ensure cancellation completes
        setTimeout(() => startSpeaking(), 50);
        return true;
      }

      const startSpeaking = () => {
        // Chrome has a 32767 character limit - truncate if needed
        const MAX_LENGTH = 32000;
        if (text.length > MAX_LENGTH) {
          console.log(`Browser TTS: Text too long (${text.length}), truncating`);
          text = text.substring(0, MAX_LENGTH) + '...';
        }

        // Wait for voices to load (important for Chrome/Edge)
        const speak = () => {
          const voices = synthesis.getVoices();

          if (voices.length === 0) {
            console.log('Browser TTS: No voices available yet, waiting...');
            // Try again after a short delay
            setTimeout(speak, 100);
            return;
          }

          console.log(`Browser TTS: Found ${voices.length} voices`);

          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'en-US';
          utterance.rate = 1;
          utterance.pitch = 1;

          // Try to use a default English voice if available
          const englishVoice = voices.find(voice => voice.lang.startsWith('en'));
          if (englishVoice) {
            utterance.voice = englishVoice;
            console.log(`Browser TTS: Using voice: ${englishVoice.name}`);
          }

          utterance.onend = () => {
            console.log('Browser TTS: Finished');
            setIsSpeaking(false);
          };

          utterance.onerror = (event) => {
            console.error('Browser TTS error:', event);
            setIsSpeaking(false);
            onError?.('Browser speech synthesis failed');
          };

          synthesis.speak(utterance);
          console.log('Browser TTS: Speaking...');
        };

        // Set speaking state immediately
        setIsSpeaking(true);

        // Start speaking (will wait for voices if needed)
        speak();
      };

      // Call startSpeaking to begin the process
      startSpeaking();

      return true;
    } catch (error) {
      console.error('Browser TTS exception:', error);
      setIsSpeaking(false);
      return false;
    }
  }, [browserTtsAvailable, onError]);

  // Initialize Speech Recognition
  const initRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    // Enable continuous mode - keep listening until user is done
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    // Increase max alternatives for better accuracy
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      // Build full transcript from all results
      let interimTranscript = '';
      let finalText = '';

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript + ' ';
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      // Combine final and interim for display
      const currentTranscript = (finalText + interimTranscript).trim();
      setTranscript(currentTranscript);

      // Store the latest transcript
      if (currentTranscript) {
        finalTranscriptRef.current = currentTranscript;
      }

      // Reset silence timer on each speech input
      // This ensures we wait for the user to STOP speaking
      clearSilenceTimer();

      silenceTimerRef.current = setTimeout(() => {
        // User has been silent for silenceTimeout ms - they're done talking
        if (finalTranscriptRef.current && !isProcessingRef.current) {
          processTranscript(finalTranscriptRef.current);
        }
      }, silenceTimeout);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      clearSilenceTimer();

      // Don't treat 'no-speech' as an error - user just didn't say anything
      if (event.error === 'no-speech') {
        console.log('Voice: No speech detected');
        return;
      }

      setIsListening(false);
      if (event.error !== 'aborted') {
        onError?.(`Speech recognition error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      // If we have a pending transcript and recognition ended, process it
      if (finalTranscriptRef.current && !isProcessingRef.current) {
        processTranscript(finalTranscriptRef.current);
      } else {
        setIsListening(false);
      }
      clearSilenceTimer();
    };

    // Handle speech start
    recognition.onspeechstart = () => {
      console.log('Voice: User started speaking...');
    };

    // Handle speech end
    recognition.onspeechend = () => {
      console.log('Voice: Speech ended, waiting for silence timeout...');
    };

    return recognition;
  }, [onError, silenceTimeout, clearSilenceTimer, processTranscript]);

  // Start listening
  const startListening = useCallback(() => {
    if (!sttSupported) {
      onError?.('Speech recognition not supported in this browser');
      return;
    }

    // Stop any ongoing speech
    stopSpeaking();

    // Reset state for new recording
    isProcessingRef.current = false;
    finalTranscriptRef.current = '';
    clearSilenceTimer();

    // Create new recognition instance for fresh start
    recognitionRef.current = initRecognition();

    if (recognitionRef.current) {
      setTranscript('');
      setIsListening(true);
      try {
        recognitionRef.current.start();
        console.log('Voice: Started listening... Speak now, I will wait until you stop.');
      } catch (error) {
        console.warn('Recognition start error:', error);
        setIsListening(false);
        onError?.('Could not start voice recognition. Please check microphone permissions.');
      }
    } else {
      // Handle case where recognition fails to initialize
      console.error('Voice: Failed to initialize speech recognition');
      onError?.('Voice recognition not available. Try Chrome or Edge browser.');
    }
  }, [sttSupported, initRecognition, onError, clearSilenceTimer, stopSpeaking]);

  // Stop listening manually
  const stopListening = useCallback(() => {
    clearSilenceTimer();

    if (recognitionRef.current) {
      // If there's a pending transcript, process it before stopping
      if (finalTranscriptRef.current && !isProcessingRef.current) {
        processTranscript(finalTranscriptRef.current);
      } else {
        recognitionRef.current.stop();
        setIsListening(false);
      }
    }
  }, [clearSilenceTimer, processTranscript]);

  // Text-to-Speech using ElevenLabs via backend with browser fallback
  const speak = useCallback(async (text: string) => {
    if (!text) return;

    stopSpeaking();

    // Try server TTS first if marked as available
    if (serverTtsAvailable) {
      try {
        console.log('TTS: Requesting speech from server...');

        const response = await axios.post('/chatbot/tts', { text }, {
          responseType: 'arraybuffer',
          timeout: 10000, // 10 second timeout to prevent hanging
        });

        console.log('TTS: Response received, size:', response.data.byteLength);

        // Only set isSpeaking true once we have audio data
        setIsSpeaking(true);

        const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);

        console.log('TTS: Audio URL created:', audioUrl);

        const audio = new Audio();
        audioRef.current = audio;

        // Set up event handlers before setting src
        audio.oncanplaythrough = () => {
          console.log('TTS: Audio can play through');
        };

        audio.onended = () => {
          console.log('TTS: Audio ended');
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          audioRef.current = null;
        };

        audio.onerror = (e) => {
          console.error('TTS: Audio error:', e);
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          audioRef.current = null;
          onError?.('Failed to play audio');
        };

        audio.onloadeddata = () => {
          console.log('TTS: Audio data loaded');
        };

        // Set source and load
        audio.src = audioUrl;
        audio.load();

        // Play with user interaction handling
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('TTS: Audio playing');
            })
            .catch((error) => {
              console.error('TTS: Play failed:', error);
              setIsSpeaking(false);
              // Auto-play might be blocked - this is a browser policy issue
              if (error.name === 'NotAllowedError') {
                onError?.('Audio autoplay blocked. Click to enable sound.');
              }
            });
        }
        return; // Success - exit early
      } catch (error) {
        console.log('TTS: Server failed, falling back to browser TTS');
        console.error('Server TTS error:', error);

        // Mark server as unavailable and cache the failure
        setServerTtsAvailable(false);
        setServerFailureCache();

        // Fall through to browser TTS below
      }
    }

    // Browser TTS fallback (either server unavailable or failed)
    if (browserTtsAvailable) {
      console.log('TTS: Using browser speech synthesis');
      const success = speakWithBrowser(text);
      if (!success) {
        onError?.('Text-to-speech not available in your browser');
      }
    } else {
      onError?.('No text-to-speech available');
    }
  }, [serverTtsAvailable, browserTtsAvailable, onError, stopSpeaking, speakWithBrowser]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearSilenceTimer();
      stopListening();
      stopSpeaking();
    };
  }, [clearSilenceTimer, stopListening, stopSpeaking]);

  return {
    // STT
    isListening,
    startListening,
    stopListening,
    transcript,
    sttSupported,

    // TTS
    isSpeaking,
    speak,
    stopSpeaking,
    ttsAvailable,
    serverTtsAvailable,
  };
}

// TypeScript declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export default useVoice;
