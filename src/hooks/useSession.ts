import { useState, useCallback, useRef, useEffect } from 'react';
import { audioService } from '../services/audioService';
import { sttService } from '../services/sttService';
import { llmService } from '../services/llmService';
import { ttsService } from '../services/ttsService';
import type { SessionStatus, TranscriptSegment, CNVAnalysis, VoiceCommandAction } from '../types';
import { VOICE_COMMANDS } from '../constants/config';

interface UseSessionReturn {
  status: SessionStatus;
  sessionDuration: number;
  transcript: TranscriptSegment[];
  lastAnalysis: CNVAnalysis | null;
  currentIntervention: string | null;
  isIntervening: boolean;
  startSession: () => Promise<void>;
  stopSession: () => Promise<void>;
  pauseSession: () => void;
  resumeSession: () => void;
  sendCommand: (command: VoiceCommandAction) => Promise<void>;
}

const COMMAND_KEYWORDS: Record<string, VoiceCommandAction> = {};
VOICE_COMMANDS.forEach((cmd) => {
  COMMAND_KEYWORDS[cmd.keyword] = cmd.action;
});

export function useSession(): UseSessionReturn {
  const [status, setStatus] = useState<SessionStatus>('idle');
  const [sessionDuration, setSessionDuration] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [lastAnalysis, setLastAnalysis] = useState<CNVAnalysis | null>(null);
  const [currentIntervention, setCurrentIntervention] = useState<string | null>(null);
  const [isIntervening, setIsIntervening] = useState(false);

  const transcriptBuffer = useRef<string[]>([]);
  const durationTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const isProcessingRef = useRef(false);
  const pendingCommand = useRef<VoiceCommandAction | null>(null);

  // Nettoyage
  useEffect(() => {
    return () => {
      audioService.cleanup();
      if (durationTimer.current) {
        clearInterval(durationTimer.current);
      }
    };
  }, []);

  // Démarrer la session
  const startSession = useCallback(async () => {
    const hasPermissions = await audioService.requestPermissions();
    if (!hasPermissions) {
      console.warn('Permissions audio refusées');
      return;
    }

    // Vérifier que les API keys sont configurées
    if (!sttService.hasApiKey() || !llmService.hasApiKey() || !ttsService.hasApiKey()) {
      console.warn('API keys manquantes');
      // En mode MVP, on continue quand même (mode dégradé)
    }

    const started = await audioService.startRecording(async (uri, _durationMs) => {
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;

      try {
        // Transcrire le segment audio
        const text = sttService.hasApiKey()
          ? await sttService.transcribe(uri)
          : null;

        if (text && text.trim().length > 0) {
          // Ajouter au buffer
          transcriptBuffer.current.push(text);

          // Vérifier les commandes vocales
          const command = detectCommand(text);

          // Analyser avec le LLM
          const fullContext = transcriptBuffer.current.join(' ');
          const intervention = await llmService.getIntervention(fullContext, command);

          // Ajouter au transcript
          setTranscript((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              speaker: 'unknown',
              text,
              timestamp: Date.now(),
            },
          ]);

          // Intervention si nécessaire
          if (intervention.shouldIntervene && intervention.intervention) {
            setCurrentIntervention(intervention.intervention);
            setIsIntervening(true);

            // Parler si le TTS est configuré
            if (ttsService.hasApiKey()) {
              const audioUri = await ttsService.speak(intervention.intervention);
              if (audioUri) {
                await audioService.playSound(audioUri);
              }
            }

            setIsIntervening(false);
          }
        }
      } catch (error) {
        console.error('Session processing error:', error);
      } finally {
        isProcessingRef.current = false;
      }
    });

    if (started) {
      setStatus('listening');
      setTranscript([]);
      transcriptBuffer.current = [];
      setSessionDuration(0);

      // Timer de durée
      durationTimer.current = setInterval(() => {
        setSessionDuration((prev) => prev + 1);
      }, 1000);
    }
  }, []);

  // Arrêter la session
  const stopSession = useCallback(async () => {
    await audioService.stopRecording();
    if (durationTimer.current) {
      clearInterval(durationTimer.current);
      durationTimer.current = null;
    }
    setStatus('idle');
    setSessionDuration(0);
    llmService.clearHistory();
    transcriptBuffer.current = [];
  }, []);

  // Pause
  const pauseSession = useCallback(() => {
    setStatus('paused');
  }, []);

  // Reprendre
  const resumeSession = useCallback(() => {
    setStatus('listening');
  }, []);

  // Envoyer une commande explicite
  const sendCommand = useCallback(async (command: VoiceCommandAction) => {
    if (status !== 'listening') return;

    pendingCommand.current = command;
    setStatus('processing');

    try {
      const context = transcriptBuffer.current.join(' ');
      const result = await llmService.getIntervention(context, command);

      if (result.intervention) {
        setCurrentIntervention(result.intervention);
        setIsIntervening(true);

        if (ttsService.hasApiKey()) {
          const audioUri = await ttsService.speak(result.intervention);
          if (audioUri) {
            audioService.playSound(audioUri);
          }
        }

        setIsIntervening(false);
      }
    } catch (error) {
      console.error('Command error:', error);
    } finally {
      pendingCommand.current = null;
      setStatus('listening');
    }
  }, [status]);

  return {
    status,
    sessionDuration,
    transcript,
    lastAnalysis,
    currentIntervention,
    isIntervening,
    startSession,
    stopSession,
    pauseSession,
    resumeSession,
    sendCommand,
  };
}

// Détection des commandes vocales dans le texte transcrit
function detectCommand(text: string): string | undefined {
  const lower = text.toLowerCase();
  for (const [keyword, action] of Object.entries(COMMAND_KEYWORDS)) {
    if (lower.includes(keyword)) {
      return action;
    }
  }
  return undefined;
}
