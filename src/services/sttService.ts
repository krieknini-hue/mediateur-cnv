/**
 * Speech-to-Text
 * Utilise l'enregistrement audio via expo-av + envoi au proxy.
 * Le proxy forwarde vers l'API STT configurée côté serveur.
 * Aucune clé API nécessaire côté client.
 */
import { PROXY_URL } from '../constants/config';

type STTCallback = (text: string) => void;

class STTService {
  private onResult: STTCallback | null = null;

  setCallback(cb: STTCallback) {
    this.onResult = cb;
  }

  /**
   * Transcrit un fichier audio via le proxy
   */
  async transcribe(audioUri: string): Promise<string | null> {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: audioUri,
        type: 'audio/wav',
        name: 'recording.wav',
      } as any);

      const response = await fetch(`${PROXY_URL}/stt`, {
        method: 'POST',
        headers: {
          // Pas d'Authorization — le proxy gère la clé
        },
        body: formData,
      });

      if (!response.ok) {
        console.warn('STT proxy error, fallback silencieux');
        return null;
      }

      const data = await response.json();
      return data.text || null;
    } catch (error) {
      console.warn('STT error (hors-ligne?):', error);
      return null;
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${PROXY_URL}/health`, {
        method: 'GET',
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const sttService = new STTService();
