import { useState, useCallback, useRef, useEffect } from 'react';
import { audioService } from '../services/audioService';
import { llmService } from '../services/llmService';
import { ttsService } from '../services/ttsService';
import { PROXY_URL } from '../constants/config';
import type { SessionStatus, TranscriptSegment, VoiceCommandAction } from '../types';
import { VOICE_COMMANDS } from '../constants/config';

interface UseSessionReturn {
  status: SessionStatus;
  sessionDuration: number;
  transcript: TranscriptSegment[];
  lastIntervention: string | null;
  isIntervening: boolean;
  isOnline: boolean;
  startSession: () => Promise<void>;
  stopSession: () => Promise<void>;
  pauseSession: () => void;
  resumeSession: () => void;
  sendCommand: (command: VoiceCommandAction) => Promise<void>;
  analyzeLastExchange: () => Promise<void>;
}

const COMMAND_KEYWORDS: Record<string, VoiceCommandAction> = {};
VOICE_COMMANDS.forEach((cmd) => {
  COMMAND_KEYWORDS[cmd.keyword] = cmd.action;
});

export function useSession(): UseSessionReturn {
  const [status, setStatus] = useState<SessionStatus>('idle');
  const [sessionDuration, setSessionDuration] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [lastIntervention, setLastIntervention] = useState<string | null>(null);
  const [isIntervening, setIsIntervening] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const transcriptBuffer = useRef<string[]>([]);
  const durationTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Vérifier la connexion au proxy au démarrage
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const resp = await fetch(`${PROXY_URL}/health`);
        setIsOnline(resp.ok);
      } catch {
        setIsOnline(false);
      }
    };
    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => {
      audioService.cleanup();
      if (durationTimer.current) clearInterval(durationTimer.current);
    };
  }, []);

  // Démarrer la session
  const startSession = useCallback(async () => {
    const hasPermissions = await audioService.requestPermissions();
    if (!hasPermissions) return;

    const started = await audioService.startRecording();
    if (started) {
      setStatus('listening');
      setTranscript([]);
      transcriptBuffer.current = [];
      setLastIntervention(null);
      setSessionDuration(0);
      llmService.clearHistory();

      durationTimer.current = setInterval(() => {
        setSessionDuration((prev) => prev + 1);
      }, 1000);
    }
  }, []);

  // Arrêter
  const stopSession = useCallback(async () => {
    await audioService.stopRecording();
    if (durationTimer.current) {
      clearInterval(durationTimer.current);
      durationTimer.current = null;
    }
    setStatus('idle');
    setSessionDuration(0);
    transcriptBuffer.current = [];
  }, []);

  // Pause / Reprendre
  const pauseSession = useCallback(() => setStatus('paused'), []);
  const resumeSession = useCallback(() => setStatus('listening'), []);

  // Exécuter une commande
  const executeCommand = useCallback(async (command?: VoiceCommandAction) => {
    setStatus('processing');
    try {
      const context = transcriptBuffer.current.join(' ');
      const result = await llmService.analyze(context, command);

      if (result.intervention) {
        setLastIntervention(result.intervention);
        setIsIntervening(true);
        await ttsService.speak(result.intervention);
        setIsIntervening(false);
      }
    } catch (error) {
      console.error('Command error:', error);
    } finally {
      setStatus('listening');
    }
  }, []);

  // Envoyer une commande explicite
  const sendCommand = useCallback(
    (command: VoiceCommandAction) => executeCommand(command),
    [executeCommand],
  );

  // Analyser le dernier échange
  const analyzeLastExchange = useCallback(async () => {
    setStatus('processing');
    try {
      const context = transcriptBuffer.current.join(' ');
      const result = await llmService.analyze(context, 'reformulate');

      if (result.intervention) {
        setLastIntervention(result.intervention);
        setIsIntervening(true);
        await ttsService.speak(result.intervention);
        setIsIntervening(false);
      } else {
        setLastIntervention("Je n'ai pas assez de contenu pour analyser. Continuez votre conversation.");
        await ttsService.speak("Je n'ai pas assez de contenu pour analyser. Continuez votre conversation.");
      }
    } catch (error) {
      console.error('Analyze error:', error);
      setLastIntervention("Désolé, je n'ai pas pu analyser l'échange. Vérifiez votre connexion.");
    } finally {
      setStatus('listening');
    }
  }, []);

  return {
    status,
    sessionDuration,
    transcript,
    lastIntervention,
    isIntervening,
    isOnline,
    startSession,
    stopSession,
    pauseSession,
    resumeSession,
    sendCommand,
    analyzeLastExchange,
  };
}
