import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { sttService, llmService, ttsService } from '../services';

interface HomeScreenProps {
  onStartSession: () => void;
}

export default function HomeScreen({ onStartSession }: HomeScreenProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [sttKey, setSttKey] = useState('');
  const [llmKey, setLlmKey] = useState('');
  const [ttsKey, setTtsKey] = useState('');

  const allKeysConfigured = sttService.hasApiKey() || llmService.hasApiKey() || ttsService.hasApiKey();

  const saveKeys = () => {
    if (sttKey) sttService.setApiKey(sttKey);
    if (llmKey) llmService.setApiKey(llmKey);
    if (ttsKey) ttsService.setApiKey(ttsKey);
    Alert.alert('✅ Clés enregistrées', 'Tu peux commencer une session.');
    setShowSettings(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Logo / Icône */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>🌸</Text>
          </View>
        </View>

        {/* Titre */}
        <Text style={styles.title}>Médiateur CNV</Text>
        <Text style={styles.subtitle}>
          Votre coach personnel en{'\n'}Communication Non Violente
        </Text>

        {/* Description */}
        <View style={styles.featureList}>
          <FeatureItem icon="🎤" text="Posez votre téléphone et parlez" />
          <FeatureItem icon="🧠" text="Analyse en temps réel" />
          <FeatureItem icon="💬" text="Reformulation bienveillante" />
          <FeatureItem icon="📋" text="Synthèse et points d'étape" />
        </View>

        {/* Bouton démarrer */}
        <TouchableOpacity
          style={[styles.startButton, !allKeysConfigured && styles.startButtonWarning]}
          onPress={onStartSession}
          activeOpacity={0.8}
        >
          <Text style={styles.startButtonText}>
            {allKeysConfigured ? '🎯 Démarrer une session' : '🔑 Configurer les clés'}
          </Text>
          <Text style={styles.startButtonSub}>
            {allKeysConfigured
              ? 'Le coach vous écoute'
              : 'Ajoutez vos clés API d\'abord'}
          </Text>
        </TouchableOpacity>

        {/* Bouton paramètres */}
        <TouchableOpacity
          style={styles.settingsToggle}
          onPress={() => setShowSettings(!showSettings)}
        >
          <Text style={styles.settingsToggleText}>
            {showSettings ? '▼ Masquer les réglages' : '▶ Configurer les API'}
          </Text>
        </TouchableOpacity>

        {/* Paramètres API */}
        {showSettings && (
          <View style={styles.settingsPanel}>
            <Text style={styles.settingsTitle}>Clés API</Text>
            <Text style={styles.settingsHint}>
              Nécessaire pour la transcription, l'analyse et la synthèse vocale
            </Text>

            <Text style={styles.label}>OpenAI Whisper (STT)</Text>
            <TextInput
              style={styles.input}
              placeholder="sk-..."
              value={sttKey}
              onChangeText={setSttKey}
              secureTextEntry
              autoCapitalize="none"
            />

            <Text style={styles.label}>DeepSeek (Analyse CNV)</Text>
            <TextInput
              style={styles.input}
              placeholder="sk-..."
              value={llmKey}
              onChangeText={setLlmKey}
              secureTextEntry
              autoCapitalize="none"
            />

            <Text style={styles.label}>ElevenLabs (Synthèse vocale)</Text>
            <TextInput
              style={styles.input}
              placeholder="Votre clé"
              value={ttsKey}
              onChangeText={setTtsKey}
              secureTextEntry
              autoCapitalize="none"
            />

            <TouchableOpacity style={styles.saveButton} onPress={saveKeys}>
              <Text style={styles.saveButtonText}>💾 Enregistrer</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Mode dégradé */}
        <Text style={styles.disclaimer}>
          Sans clés API, l'application fonctionne en{'\n'}mode démo sans IA réelle
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
  },
  iconContainer: {
    marginBottom: Spacing.lg,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primaryLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 48,
  },
  title: {
    fontSize: FontSize.titleLarge,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 24,
  },
  featureList: {
    width: '100%',
    marginBottom: Spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: Spacing.md,
  },
  featureText: {
    fontSize: FontSize.body,
    color: Colors.text,
  },
  startButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    width: '100%',
    alignItems: 'center',
    marginBottom: Spacing.md,
    elevation: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  startButtonWarning: {
    backgroundColor: Colors.warning,
  },
  startButtonText: {
    fontSize: FontSize.bodyLarge,
    fontWeight: '600',
    color: '#fff',
  },
  startButtonSub: {
    fontSize: FontSize.caption,
    color: '#fff',
    opacity: 0.8,
    marginTop: 4,
  },
  settingsToggle: {
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
  },
  settingsToggleText: {
    fontSize: FontSize.body,
    color: Colors.primary,
    textAlign: 'center',
  },
  settingsPanel: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  settingsTitle: {
    fontSize: FontSize.subtitle,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  settingsHint: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSize.body,
    fontWeight: '500',
    color: Colors.text,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    fontSize: FontSize.body,
    color: Colors.text,
    backgroundColor: Colors.background,
  },
  saveButton: {
    backgroundColor: Colors.success,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  saveButtonText: {
    fontSize: FontSize.body,
    fontWeight: '600',
    color: '#fff',
  },
  disclaimer: {
    fontSize: FontSize.caption,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 18,
  },
});
