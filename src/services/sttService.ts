/**
 * Speech-to-Text via le proxy Deepgram
 * Envoie l'audio enregistré au proxy, qui le forwarde à Deepgram.
 * Aucune clé API nécessaire côté utilisateur.
 * Deepgram gère la diarization automatique (locuteur A/B).
 */
import { PROXY_URL } from '../constants/config';

interface STTResult {
  text: string | null;
  speakers: number;
}

type STTCallback = (text: string) => void;

class STTService {
  private onResult: STTCallback | null = null;

  setCallback(cb: STTCallback) {
    this.onResult = cb;
  }

  /**
   * Transcrit un fichier audio via le proxy
   * Retourne le texte transcrit et le nombre de locuteurs détectés
   */
  async transcribe(audioUri: string): Promise<STTResult> {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: audioUri,
        type: 'audio/wav',
        name: 'recording.wav',
      } as any);

      const response = await fetch(`${PROXY_URL}/stt`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        console.warn('STT proxy error');
        return { text: null, speakers: 0 };
      }

      const data = await response.json();

      if (data.text) {
        this.onResult?.(data.text);
      }

      return {
        text: data.text || null,
        speakers: data.speakers || 0,
      };
    } catch (error) {
      console.warn('STT error:', error);
      return { text: null, speakers: 0 };
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${PROXY_URL}/health`);
      const data = await response.json();
      return data.stt === true;
    } catch {
      return false;
    }
  }
}

export const sttService = new STTService();
