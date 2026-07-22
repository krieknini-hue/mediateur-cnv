import React, { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import SessionScreen from './src/screens/SessionScreen';
import { useSession } from './src/hooks/useSession';
import type { VoiceCommandAction } from './src/types';

export default function App() {
  const [sessionActive, setSessionActive] = useState(false);
  const {
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
  } = useSession();

  const handleStart = useCallback(async () => {
    await startSession();
    setSessionActive(true);
  }, [startSession]);

  const handleStop = useCallback(async () => {
    Alert.alert(
      'Arrêter la session ?',
      'Le transcript sera conservé.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Arrêter',
          style: 'destructive',
          onPress: async () => {
            await stopSession();
            setSessionActive(false);
          },
        },
      ],
    );
  }, [stopSession]);

  const handleCommand = useCallback(
    (action: string) => sendCommand(action as VoiceCommandAction),
    [sendCommand],
  );

  if (!sessionActive) {
    return <HomeScreen onStartSession={handleStart} />;
  }

  return (
    <SessionScreen
      status={status}
      sessionDuration={sessionDuration}
      transcript={transcript}
      currentIntervention={lastIntervention}
      isIntervening={isIntervening}
      isOnline={isOnline}
      onStop={handleStop}
      onPause={pauseSession}
      onResume={resumeSession}
      onCommand={handleCommand}
      onAnalyze={analyzeLastExchange}
    />
  );
}
