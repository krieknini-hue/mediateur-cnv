/**
 * Text-to-Speech
 * Utilise le synthétiseur vocal natif d'Android/iOS via expo-speech.
 * Fonctionne hors-ligne, aucune clé API nécessaire.
 */
import * as Speech from 'expo-speech';

class TTSService {
  private isSpeaking = false;

  /**
   * Prononce un texte à voix haute
   */
  async speak(text: string): Promise<void> {
    if (this.isSpeaking) {
      await Speech.stop();
    }

    this.isSpeaking = true;

    return new Promise((resolve) => {
      Speech.speak(text, {
        language: 'fr-FR',
        pitch: 1.0,
        rate: 0.85, // Plus lent = plus apaisant
        onDone: () => {
          this.isSpeaking = false;
          resolve();
        },
        onStopped: () => {
          this.isSpeaking = false;
          resolve();
        },
        onError: () => {
          this.isSpeaking = false;
          resolve();
        },
      });
    });
  }

  /**
   * Prédit un son d'alerte doux (notification simple)
   */
  async playChime(): Promise<void> {
    // On murmure un petit son
    await this.speak('...');
  }

  /**
   * Arrête la synthèse vocale en cours
   */
  async stop(): Promise<void> {
    if (this.isSpeaking) {
      await Speech.stop();
      this.isSpeaking = false;
    }
  }

  get isCurrentlySpeaking(): boolean {
    return this.isSpeaking;
  }
}

export const ttsService = new TTSService();
