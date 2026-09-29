import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, AlertCircle, RefreshCw } from 'lucide-react';
import { receiverSounds } from '../utils/audioChimes';

interface AudioReceiverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAudioReceived: (transcript: string) => void;
  darkMode: boolean;
}

export const AudioReceiverModal: React.FC<AudioReceiverModalProps> = ({
  isOpen,
  onClose,
  onAudioReceived,
  darkMode,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [statusMessage, setStatusMessage] = useState('Listening...');
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  const microphoneStreamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);
  const committedRef = useRef(false);

  // Initialize voice capture or permission check when opened
  useEffect(() => {
    if (!isOpen) {
      cleanupAudio();
      return;
    }

    setTranscript('');
    setInterimTranscript('');
    setPermissionError(null);
    setStatusMessage('Listening...');
    committedRef.current = false;

    // Begin microphone check / voice capture
    initMicrophoneAndListen();

    return () => {
      cleanupAudio();
    };
  }, [isOpen]);

  const cleanupAudio = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }
    if (microphoneStreamRef.current) {
      microphoneStreamRef.current.getTracks().forEach((track) => track.stop());
      microphoneStreamRef.current = null;
    }
    setIsListening(false);
    setIsRequestingPermission(false);
  };

  // Convert captured voice to text, place in search bar, and immediately perform search
  const commitSpeechAndSearch = (textToSearch: string) => {
    const cleaned = textToSearch.trim();
    if (!cleaned || committedRef.current) return;
    committedRef.current = true;

    setTranscript(cleaned);
    setInterimTranscript('');
    setStatusMessage(`Searching for "${cleaned}"...`);
    setIsListening(false);

    receiverSounds.playSuccessChime();
    cleanupAudio();

    // Automatically place text in search bar and immediately perform search
    onAudioReceived(cleaned);
    onClose();
  };

  // Check stored permission or request permission if needed
  const initMicrophoneAndListen = async () => {
    cleanupAudio();
    committedRef.current = false;
    setTranscript('');
    setInterimTranscript('');
    setPermissionError(null);

    // Check if permission is already remembered as granted
    const storedPermission = localStorage.getItem('viewtube_mic_permission');
    let isAlreadyGranted = storedPermission === 'granted';

    // Verify with Permissions API if supported
    if (!isAlreadyGranted && typeof navigator !== 'undefined' && navigator.permissions?.query) {
      try {
        const queryRes = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        if (queryRes.state === 'granted') {
          isAlreadyGranted = true;
          localStorage.setItem('viewtube_mic_permission', 'granted');
        }
      } catch {
        // Fallback for browsers that don't support microphone query
      }
    }

    if (isAlreadyGranted) {
      // Permission is already granted and remembered: directly start listening!
      // Browser will NOT ask again.
      receiverSounds.playStartChime();
      startSpeechRecognition();
    } else {
      // First-time or not yet granted: request browser microphone permission
      setIsRequestingPermission(true);
      setStatusMessage('Requesting microphone permission...');

      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('getUserMedia not supported in this browser');
        }

        // Trigger browser's native Allow/Block dialog
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // Once permission is granted by the user:
        // 1. Remember the permission for the website so the user is not asked again
        localStorage.setItem('viewtube_mic_permission', 'granted');
        setIsRequestingPermission(false);

        // 2. Stop the temporary audio track
        stream.getTracks().forEach((track) => track.stop());

        // 3. Directly capture speech and convert into search bar text
        receiverSounds.playStartChime();
        startSpeechRecognition();
      } catch (err: any) {
        console.warn('Microphone permission request error:', err);
        setIsRequestingPermission(false);
        setIsListening(false);

        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          localStorage.setItem('viewtube_mic_permission', 'denied');
          setPermissionError(
            'Microphone access was blocked. Please allow microphone permission in your browser or click Try Again below.'
          );
        } else {
          setPermissionError(
            'Could not access microphone. Please check your audio device settings and try again.'
          );
        }
        setStatusMessage('Microphone access needed to search');
      }
    }
  };

  const startSpeechRecognition = () => {
    let hasSpeechRecognition = false;

    if (typeof window !== 'undefined') {
      const SpeechRecognitionClass =
        (window as unknown as { SpeechRecognition: any; webkitSpeechRecognition: any }).SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition: any }).webkitSpeechRecognition;

      if (SpeechRecognitionClass) {
        try {
          const recognition = new SpeechRecognitionClass();
          recognition.continuous = false;
          recognition.interimResults = true;
          recognition.lang = 'en-US';

          recognition.onstart = () => {
            setIsListening(true);
            setStatusMessage('Listening... Speak now');
            setPermissionError(null);
          };

          recognition.onresult = (event: any) => {
            let finalResult = '';
            let interimResult = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
              const res = event.results[i];
              if (res.isFinal) {
                finalResult += res[0].transcript;
              } else {
                interimResult += res[0].transcript;
              }
            }

            const currentSpoken = finalResult || interimResult;
            if (currentSpoken) {
              setInterimTranscript(currentSpoken);
            }

            if (finalResult.trim()) {
              commitSpeechAndSearch(finalResult.trim());
            } else if (interimResult.trim()) {
              // Auto-commit if user stops speaking for 1.1 seconds
              if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
              silenceTimerRef.current = setTimeout(() => {
                commitSpeechAndSearch(interimResult.trim());
              }, 1100);
            }
          };

          recognition.onerror = (e: any) => {
            console.warn('Speech recognition event:', e?.error);
            if (e?.error === 'not-allowed') {
              localStorage.setItem('viewtube_mic_permission', 'denied');
              setPermissionError(
                'Microphone access was denied. Please allow microphone access in your browser.'
              );
              setIsListening(false);
            } else if (e?.error === 'no-speech') {
              setStatusMessage('No speech detected. Tap the microphone to speak.');
              setIsListening(false);
            }
          };

          recognition.onend = () => {
            if (!committedRef.current && interimTranscript.trim()) {
              commitSpeechAndSearch(interimTranscript.trim());
            } else if (!committedRef.current) {
              setIsListening(false);
              setStatusMessage('Tap the microphone to speak');
            }
          };

          recognitionRef.current = recognition;
          recognition.start();
          hasSpeechRecognition = true;
        } catch (e) {
          console.warn('Speech recognition start failed:', e);
        }
      }
    }

    if (!hasSpeechRecognition) {
      setStatusMessage('Speech recognition is not supported in this browser.');
    }
  };

  if (!isOpen) return null;

  const currentDisplay = transcript || interimTranscript;

  return (
    <div
      id="audio-receiver-dialog-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="audio-receiver-dialog"
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-sm rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center relative border transition-all ${
          darkMode ? 'bg-[#212121] text-white border-[#333333]' : 'bg-white text-slate-900 border-slate-200'
        }`}
      >
        {/* Close Button */}
        <button
          id="btn-close-audio-receiver"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-800/50 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          title="Close"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <h2 className="text-xl font-bold tracking-tight mb-2">
          {currentDisplay ? currentDisplay : statusMessage}
        </h2>
        <p className="text-xs text-neutral-400 mb-8">
          {currentDisplay
            ? 'Converting to text & searching...'
            : isRequestingPermission
            ? 'Please choose Allow when prompted by your browser'
            : 'Speak into your microphone'}
        </p>

        {/* Microphone Button */}
        <div className="relative my-4 flex items-center justify-center">
          {/* Concentric pulsing ripple rings when listening */}
          {isListening && (
            <>
              <div className="absolute w-28 h-28 rounded-full bg-red-600/25 animate-ping" />
              <div className="absolute w-36 h-36 rounded-full bg-red-500/15 animate-pulse" />
            </>
          )}

          <button
            id="btn-modal-mic"
            type="button"
            onClick={() => {
              if (permissionError) {
                initMicrophoneAndListen();
              } else if (isListening) {
                cleanupAudio();
                setStatusMessage('Tap the microphone to speak');
              } else {
                initMicrophoneAndListen();
              }
            }}
            className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xl ${
              isListening
                ? 'bg-red-600 text-white ring-8 ring-red-500/30 hover:bg-red-700'
                : permissionError
                ? 'bg-amber-600/30 text-amber-400 ring-4 ring-amber-500/20 hover:bg-amber-600/50'
                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white'
            }`}
            title={
              permissionError
                ? 'Click to request microphone permission'
                : isListening
                ? 'Listening (Click to pause)'
                : 'Click to speak'
            }
            aria-label="Microphone"
          >
            {isListening ? (
              <Mic className="w-10 h-10 animate-pulse" />
            ) : (
              <MicOff className="w-10 h-10" />
            )}
          </button>
        </div>

        {/* Permission Error Warning & Re-Request Button */}
        {permissionError && (
          <div className="w-full mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex flex-col items-center gap-2.5 text-center">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{permissionError}</span>
            </div>
            <button
              id="btn-retry-mic-permission"
              type="button"
              onClick={initMicrophoneAndListen}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Allow Microphone / Try Again</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
