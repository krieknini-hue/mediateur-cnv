import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { PROXY_URL } from '../constants/config';

interface HomeScreenProps {
  onStartSession: () => void;
}

export default function HomeScreen({ onStartSession }: HomeScreenProps) {
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

        {/* Description des fonctionnalités */}
        <View style={styles.featureList}>
          <FeatureItem icon="🎤" text="Posez votre téléphone et parlez" />
          <FeatureItem icon="🧠" text="Analyse CNV en temps réel" />
          <FeatureItem icon="💬" text="Reformulation bienveillante" />
          <FeatureItem icon="📋" text="Points d'étape et synthèses" />
          <FeatureItem icon="🎯" text="Détection des tensions" />
        </View>

        {/* Mention zéro configuration */}
        <View style={styles.zeroConfig}>
          <Text style={styles.zeroConfigIcon}>🔒</Text>
          <Text style={styles.zeroConfigText}>
            Aucune configuration requise —{'\n'}ça marche directement
          </Text>
        </View>

        {/* Bouton démarrer */}
        <TouchableOpacity
          style={styles.startButton}
          onPress={onStartSession}
          activeOpacity={0.8}
        >
          <Text style={styles.startButtonText}>🎯 Démarrer une session</Text>
          <Text style={styles.startButtonSub}>
            Le coach vous écoute et vous guide
          </Text>
        </TouchableOpacity>

        {/* Note privée */}
        <Text style={styles.note}>
          💡 Conseil : pour une première utilisation,{'\n'}
          asseyez-vous dans un endroit calme et parlez naturellement
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
    marginBottom: Spacing.lg,
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
  zeroConfig: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success + '15',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    width: '100%',
  },
  zeroConfigIcon: {
    fontSize: 18,
    marginRight: Spacing.sm,
  },
  zeroConfigText: {
    fontSize: FontSize.caption,
    color: Colors.success,
    fontWeight: '500',
    lineHeight: 18,
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
  note: {
    fontSize: FontSize.caption,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 18,
  },
});
