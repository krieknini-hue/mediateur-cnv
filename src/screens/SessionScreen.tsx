import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Animated,
} from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import type { SessionStatus, TranscriptSegment } from '../types';

interface SessionScreenProps {
  status: SessionStatus;
  sessionDuration: number;
  transcript: TranscriptSegment[];
  currentIntervention: string | null;
  isIntervening: boolean;
  onStop: () => void;
  onPause: () => void;
  onResume: () => void;
  onCommand: (cmd: string) => void;
}

export default function SessionScreen({
  status,
  sessionDuration,
  transcript,
  currentIntervention,
  isIntervening,
  onStop,
  onPause,
  onResume,
  onCommand,
}: SessionScreenProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Animation de pulsation selon l'état
  useEffect(() => {
    const animate = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.6,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    };

    if (status === 'listening') {
      animate();
    } else {
      pulseAnim.setValue(1);
    }
  }, [status, pulseAnim]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'listening':
        return { label: '🎧 Écoute active', color: Colors.listening };
      case 'processing':
        return { label: '🤔 Analyse en cours', color: Colors.processing };
      case 'speaking':
        return { label: '💬 Coach s\'exprime', color: Colors.speaking };
      case 'paused':
        return { label: '⏸ En pause', color: Colors.paused };
      default:
        return { label: 'Prêt', color: Colors.textSecondary };
    }
  };

  const statusConfig = getStatusConfig();

  const quickCommands = [
    { label: 'Reformule', action: 'reformulate', icon: '🔄' },
    { label: 'Résumé', action: 'synthesize', icon: '📋' },
    { label: 'Besoins', action: 'needs', icon: '🎯' },
    { label: 'Point', action: 'step_check', icon: '📍' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header - statut animé */}
      <View style={styles.header}>
        <Animated.View
          style={[
            styles.statusDot,
            { backgroundColor: statusConfig.color, opacity: pulseAnim },
          ]}
        />
        <Text style={styles.statusLabel}>{statusConfig.label}</Text>
        <Text style={styles.duration}>{formatTime(sessionDuration)}</Text>
      </View>

      {/* Zone d'intervention */}
      {currentIntervention && (
        <View style={styles.interventionBubble}>
          <Text style={styles.interventionCoach}>🌸 Coach CNV</Text>
          <Text style={styles.interventionText}>{currentIntervention}</Text>
          {isIntervening && (
            <Text style={styles.interventionSpeaking}>🔊 en cours...</Text>
          )}
        </View>
      )}

      {/* Quick commands */}
      <View style={styles.commandsRow}>
        {quickCommands.map((cmd) => (
          <TouchableOpacity
            key={cmd.action}
            style={[
              styles.commandButton,
              status !== 'listening' && styles.commandButtonDisabled,
            ]}
            onPress={() => onCommand(cmd.action)}
            disabled={status !== 'listening'}
          >
            <Text style={styles.commandIcon}>{cmd.icon}</Text>
            <Text style={styles.commandLabel}>{cmd.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Transcript en temps réel */}
      <View style={styles.transcriptContainer}>
        <Text style={styles.transcriptTitle}>Transcript</Text>
        {transcript.length === 0 ? (
          <View style={styles.emptyTranscript}>
            <Text style={styles.emptyText}>La conversation apparaîtra ici</Text>
            <Text style={styles.emptySub}>
            Posez votre téléphone et parlez naturellement
            </Text>
          </View>
        ) : (
          <FlatList
            data={transcript.slice(-20)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.transcriptItem}>
                <Text style={styles.transcriptTime}>
                  {new Date(item.timestamp).toLocaleTimeString()}
                </Text>
                <Text style={styles.transcriptText}>{item.text}</Text>
              </View>
            )}
          />
        )}
      </View>

      {/* Contrôles */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={status === 'paused' ? onResume : onPause}
        >
          <Text style={styles.controlIcon}>
            {status === 'paused' ? '▶️' : '⏸'}
          </Text>
          <Text style={styles.controlLabel}>
            {status === 'paused' ? 'Reprendre' : 'Pause'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.stopButton, !currentIntervention && styles.stopButtonMargin]}
          onPress={onStop}
        >
          <Text style={styles.stopIcon}>⏹</Text>
          <Text style={styles.stopText}>Arrêter</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.sm,
  },
  statusLabel: {
    fontSize: FontSize.body,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  duration: {
    fontSize: FontSize.bodyLarge,
    fontWeight: '700',
    color: Colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  interventionBubble: {
    backgroundColor: Colors.primaryLight + '20',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  interventionCoach: {
    fontSize: FontSize.caption,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  interventionText: {
    fontSize: FontSize.body,
    color: Colors.text,
    lineHeight: 24,
  },
  interventionSpeaking: {
    fontSize: FontSize.caption,
    color: Colors.primary,
    marginTop: Spacing.xs,
    fontStyle: 'italic',
  },
  commandsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  commandButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  commandButtonDisabled: {
    opacity: 0.5,
  },
  commandIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  commandLabel: {
    fontSize: FontSize.caption,
    color: Colors.text,
    fontWeight: '500',
  },
  transcriptContainer: {
    flex: 1,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  transcriptTitle: {
    fontSize: FontSize.caption,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  emptyTranscript: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FontSize.body,
    color: Colors.textLight,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: FontSize.caption,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  transcriptItem: {
    marginBottom: Spacing.sm,
  },
  transcriptTime: {
    fontSize: 10,
    color: Colors.textLight,
    marginBottom: 2,
  },
  transcriptText: {
    fontSize: FontSize.body,
    color: Colors.text,
    lineHeight: 22,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  controlButton: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  controlIcon: {
    fontSize: 24,
  },
  controlLabel: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  stopButton: {
    backgroundColor: Colors.danger + '15',
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  stopButtonMargin: {},
  stopIcon: {
    fontSize: 24,
  },
  stopText: {
    fontSize: FontSize.caption,
    color: Colors.danger,
    fontWeight: '600',
    marginTop: 2,
  },
});
