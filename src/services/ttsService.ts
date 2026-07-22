import { TTS_CONFIG } from '../constants/config';

class TTSService {
  private apiKey: string = '';

  setApiKey(key: string) {
    this.apiKey = key;
  }

  hasApiKey(): boolean {
    return this.apiKey.length > 0;
  }

  async speak(text: string): Promise<string | null> {
    if (!this.apiKey) {
      console.warn('TTS API key not configured');
      return null;
    }

    try {
      const config = TTS_CONFIG.elevenlabs;

      const response = await fetch(
        `${config.baseUrl}/${config.voiceId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKey,
          },
          body: JSON.stringify({
            text,
            model_id: config.model,
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.7,
              style: 0.2,
            },
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`TTS API error: ${response.status}`);
      }

      // Convertir la réponse en blob puis en URI locale
      const blob = await response.blob();
      const reader = new FileReader();

      return new Promise<string | null>((resolve, reject) => {
        reader.onloadend = () => {
          if (reader.result && typeof reader.result === 'string') {
            resolve(reader.result); // data URI
          } else {
            resolve(null);
          }
        };
        reader.onerror = () => reject(null);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('TTS synthesis error:', error);
      return null;
    }
  }
}

export const ttsService = new TTSService();
