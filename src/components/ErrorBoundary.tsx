import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App crashed:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.emoji}>💥</Text>
            <Text style={styles.title}>Oups, l'app a planté</Text>
            <Text style={styles.subtitle}>Voici l'erreur pour le diagnostic :</Text>
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>
                {this.state.error?.name || 'Erreur inconnue'}
              </Text>
              <Text style={styles.errorDetail}>
                {this.state.error?.message || 'Aucun détail'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                this.setState({ hasError: false, error: null });
              }}
            >
              <Text style={styles.buttonText}>🔄 Réessayer</Text>
            </TouchableOpacity>
            <Text style={styles.footer}>
              Signale cette erreur au développeur pour correction
            </Text>
          </ScrollView>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F8FA' },
  content: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emoji: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#2D3436', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#636E72', marginBottom: 24, textAlign: 'center' },
  errorBox: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: '#DFE6E9',
    marginBottom: 24,
  },
  errorText: { fontSize: 14, fontWeight: '600', color: '#D9534F', marginBottom: 8 },
  errorDetail: { fontSize: 13, color: '#636E72', lineHeight: 20 },
  button: {
    backgroundColor: '#4A90D9',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  buttonText: { fontSize: 16, fontWeight: '600', color: '#FFF' },
  footer: { fontSize: 12, color: '#B2BEC3', marginTop: 24, textAlign: 'center' },
});
