// App de test minimale — juste pour vérifier que l'APK s'installe et se lance
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>🌸</Text>
        <Text style={styles.title}>Médiateur CNV</Text>
        <Text style={styles.subtitle}>Version test — app minimale</Text>
        <View style={styles.statusBox}>
          <Text style={styles.statusText}>✅ APK fonctionnelle</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F8FA' },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  icon: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#2D3436', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#636E72', marginBottom: 24 },
  statusBox: {
    backgroundColor: '#5CB85C20',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  statusText: { fontSize: 16, fontWeight: '600', color: '#5CB85C' },
});
