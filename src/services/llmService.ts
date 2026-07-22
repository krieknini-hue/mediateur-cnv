import { LLM_CONFIG, PROXY_URL } from '../constants/config';

interface LLMResponse {
  intervention: string | null;
  type: string;
  shouldIntervene: boolean;
}

class LLMService {
  private conversationHistory: { role: string; content: string }[] = [];
  private systemPrompt: string;

  constructor() {
    this.systemPrompt = LLM_CONFIG.systemPrompt;
  }

  private getApiUrl(): string {
    return LLM_CONFIG.proxyUrl;
  }

  /**
   * Analyse le transcript via le proxy (pas de clé API côté client)
   */
  async analyze(
    transcript: string,
    command?: string,
  ): Promise<LLMResponse> {
    // Construire le message
    let prompt = transcript;

    if (command) {
      const commands: Record<string, string> = {
        reformulate: 'Propose une reformulation CNV de cet échange.',
        synthesize: 'Fais une synthèse de ce qui a été dit jusqu\'à présent.',
        needs: 'Analyse les besoins sous-jacents exprimés dans cet échange.',
        step_check: 'Fais un point d\'étape sur la conversation.',
        rewind: 'Résume le dernier point important.',
      };
      prompt = `${commands[command] || ''}\n\nTranscription:\n${transcript}`;
    }

    const messages = [
      { role: 'system', content: this.systemPrompt },
      ...this.conversationHistory.slice(-6),
      { role: 'user', content: prompt },
    ];

    try {
      const response = await fetch(this.getApiUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          max_tokens: 400,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`Proxy error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        return { intervention: null, type: 'silent', shouldIntervene: false };
      }

      // Ajouter à l'historique
      this.conversationHistory.push(
        { role: 'user', content: prompt },
        { role: 'assistant', content },
      );

      // Analyser le contenu de la réponse
      return this.parseResponse(content);
    } catch (error) {
      console.error('LLM error:', error);
      return { intervention: null, type: 'silent', shouldIntervene: false };
    }
  }

  private parseResponse(content: string): LLMResponse {
    // Détecter les mots-clés d'intervention
    const lower = content.toLowerCase();

    // Vérifier si c'est une intervention significative
    if (content.length < 20) {
      return { intervention: null, type: 'silent', shouldIntervene: false };
    }

    let type = 'silent';
    let shouldIntervene = false;

    const hasWarning = lower.includes('attention') || lower.includes('alerte') || lower.includes('tension');
    const hasReformulation = lower.includes('reformul') || lower.includes('pourrais-tu') || lower.includes('peut-être');
    const hasSynthesis = lower.includes('synthèse') || lower.includes('résumé') || lower.includes('en résumé');
    const hasStepCheck = lower.includes('point') || lower.includes('récap');
    const hasNeeds = lower.includes('besoin') || lower.includes('sentiment');

    if (hasWarning) {
      type = 'warning';
      shouldIntervene = true;
    } else if (hasReformulation) {
      type = 'reformulation';
      shouldIntervene = true;
    } else if (hasSynthesis) {
      type = 'synthesis';
      shouldIntervene = true;
    } else if (hasStepCheck && hasNeeds) {
      type = 'needs_analysis';
      shouldIntervene = true;
    }

    return {
      intervention: shouldIntervene ? content : null,
      type,
      shouldIntervene,
    };
  }

  clearHistory() {
    this.conversationHistory = [];
  }
}

export const llmService = new LLMService();
