import { STT_CONFIG } from '../constants/config';

class STTService {
  private apiKey: string = '';

  setApiKey(key: string) {
    this.apiKey = key;
  }

  hasApiKey(): boolean {
    return this.apiKey.length > 0;
  }

  async transcribe(audioUri: string): Promise<string | null> {
    if (!this.apiKey) {
      console.warn('STT API key not configured');
      return null;
    }

    try {
      const config = STT_CONFIG.openai;

      const formData = new FormData();
      formData.append('file', {
        uri: audioUri,
        type: 'audio/wav',
        name: 'recording.wav',
      } as any);
      formData.append('model', config.model);
      formData.append('language', 'fr');

      const response = await fetch(config.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`STT API error: ${response.status}`);
      }

      const data = await response.json();
      return data.text || null;
    } catch (error) {
      console.error('STT transcription error:', error);
      return null;
    }
  }
}

export const sttService = new STTService();
