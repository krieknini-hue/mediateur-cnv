import { LLM_CONFIG } from '../constants/config';
import type { LLMOutput } from '../types';

interface LLMResult {
  intervention: string | null;
  type: string;
  shouldIntervene: boolean;
  escalationLevel: 'LOW' | 'MEDIUM' | 'HIGH' | null;
  needsA: string | null;
  needsB: string | null;
}

class LLMService {
  private conversationHistory: { role: string; content: string }[] = [];

  clearHistory() {
    this.conversationHistory = [];
  }

  /**
   * Analyse le transcript via le proxy DeepSeek
   */
  async analyze(transcript: string, command?: string): Promise<LLMResult> {
    // Construire le message selon le format attendu par le prompt
    let prompt = transcript;

    if (command) {
      const commands: Record<string, string> = {
        reformulate: 'REFORMULE',
        synthesize: 'RÉSUMÉ',
        needs: 'BESOINS',
        step_check: "POINT D'ÉTAPE",
        rewind: 'RÉSUMÉ',
      };
      prompt = `${commands[command] || ''}\n\n${transcript}`;
    }

    // Format attendu par le prompt : [Locuteur A/B] : "texte"
    const formattedInput = `[Locuteur A] : "${prompt}"`;

    const messages = [
      { role: 'system', content: LLM_CONFIG.systemPrompt },
      ...this.conversationHistory.slice(-4),
      { role: 'user', content: formattedInput },
    ];

    try {
      const response = await fetch(LLM_CONFIG.proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, max_tokens: 300, temperature: 0.7 }),
      });

      if (!response.ok) {
        throw new Error(`Proxy error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        return emptyResult();
      }

      // Ajouter à l'historique
      this.conversationHistory.push(
        { role: 'user', content: formattedInput },
        { role: 'assistant', content },
      );

      // Parser la réponse JSON du LLM
      return this.parseLLMOutput(content);
    } catch (error) {
      console.error('LLM error:', error);
      return emptyResult();
    }
  }

  private parseLLMOutput(content: string): LLMResult {
    try {
      // Extraire le JSON de la réponse (le LLM peut ajouter du texte avant/après)
      const jsonMatch = content.match(/\{[\s\S]*"spoken_response"[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : content;
      const parsed: LLMOutput = JSON.parse(jsonStr);

      if (parsed.should_speak && parsed.spoken_response) {
        let type = 'reformulation';

        if (parsed.escalation_level === 'HIGH') type = 'warning';
        else if (parsed.escalation_level === 'MEDIUM') type = 'reformulation';
        else type = 'silent';

        // Si commande explicite, forcer le type
        const isCommand = content.includes('REFORMULE') || content.includes('RÉSUMÉ') || content.includes('BESOINS');
        if (isCommand && parsed.should_speak) {
          if (content.includes('RÉSUMÉ')) type = 'synthesis';
          else if (content.includes('BESOINS')) type = 'needs_analysis';
          else type = 'reformulation';
        }

        return {
          intervention: parsed.spoken_response,
          type,
          shouldIntervene: true,
          escalationLevel: parsed.escalation_level,
          needsA: parsed.detected_needs?.speaker_A || null,
          needsB: parsed.detected_needs?.speaker_B || null,
        };
      }

      return {
        ...emptyResult(),
        escalationLevel: parsed.escalation_level || null,
        needsA: parsed.detected_needs?.speaker_A || null,
        needsB: parsed.detected_needs?.speaker_B || null,
      };
    } catch {
      // Fallback: si le JSON est invalide, on traite comme du texte
      if (content.length > 20) {
        return {
          intervention: content,
          type: 'reformulation',
          shouldIntervene: true,
          escalationLevel: null,
          needsA: null,
          needsB: null,
        };
      }
      return emptyResult();
    }
  }
}

function emptyResult(): LLMResult {
  return {
    intervention: null,
    type: 'silent',
    shouldIntervene: false,
    escalationLevel: null,
    needsA: null,
    needsB: null,
  };
}

export const llmService = new LLMService();
