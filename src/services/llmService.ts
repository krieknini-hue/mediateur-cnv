import { LLM_CONFIG } from '../constants/config';
import type { CNVAnalysis } from '../types';

interface LLMResponse {
  type: 'reformulation' | 'warning' | 'synthesis' | 'step_check' | 'needs_analysis' | 'silent';
  escaladeLevel: number;
  intervention: string | null;
  observations: string[];
  feelings: string[];
  needs: string[];
  reformulation: string | null;
  explanation: string | null;
}

class LLMService {
  private apiKey: string = '';
  private conversationHistory: { role: string; content: string }[] = [];
  private systemPrompt: string;

  constructor() {
    this.systemPrompt = LLM_CONFIG.systemPrompt;
  }

  setApiKey(key: string) {
    this.apiKey = key;
  }

  hasApiKey(): boolean {
    return this.apiKey.length > 0;
  }

  private getConfig() {
    return LLM_CONFIG.deepseek;
  }

  async analyzeTranscript(
    transcript: string,
    command?: string,
  ): Promise<CNVAnalysis | null> {
    if (!this.apiKey) {
      console.warn('LLM API key not configured');
      return null;
    }

    // Construire le message avec le contexte
    const userMessage = command
      ? `[Commande: ${command}]\n\nTranscription à analyser :\n${transcript}`
      : `Transcription à analyser :\n${transcript}`;

    const messages = [
      { role: 'system', content: this.systemPrompt },
      ...this.conversationHistory.slice(-10), // Garder les 10 derniers échanges
      { role: 'user', content: userMessage },
    ];

    try {
      const config = this.getConfig();
      const response = await fetch(config.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model,
          messages,
          max_tokens: 500,
          temperature: 0.7,
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        throw new Error(`LLM API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('Empty LLM response');
      }

      // Parser la réponse JSON
      const llmResponse: LLMResponse = JSON.parse(content);

      // Ajouter à l'historique
      this.conversationHistory.push(
        { role: 'user', content: userMessage },
        { role: 'assistant', content },
      );

      // Convertir en CNVAnalysis
      return {
        observations: llmResponse.observations || [],
        feelings: llmResponse.feelings || [],
        needs: llmResponse.needs || [],
        requests: [],
        escaladeLevel: llmResponse.escaladeLevel || 1,
        reformulation: llmResponse.reformulation || undefined,
        synthesis: llmResponse.type === 'synthesis' ? llmResponse.intervention || undefined : undefined,
      };
    } catch (error) {
      console.error('LLM analysis error:', error);
      return null;
    }
  }

  async getIntervention(transcript: string, command?: string): Promise<{
    intervention: string | null;
    type: string;
    shouldIntervene: boolean;
  }> {
    const analysis = await this.analyzeTranscript(transcript, command);
    if (!analysis) {
      return { intervention: null, type: 'silent', shouldIntervene: false };
    }

    const shouldIntervene =
      analysis.escaladeLevel >= 6 ||
      !!analysis.reformulation ||
      command !== undefined;

    let intervention: string | null = null;
    let type = 'silent';

    if (command === 'reformulate' && analysis.reformulation) {
      intervention = `Voici une reformulation CNV : ${analysis.reformulation}`;
      type = 'reformulation';
    } else if (command === 'synthesize') {
      intervention = analysis.synthesis || null;
      type = 'synthesis';
    } else if (command === 'needs' && analysis.needs.length > 0) {
      intervention = `Je détecte ces besoins : ${analysis.needs.join(', ')}`;
      type = 'needs_analysis';
    } else if (analysis.escaladeLevel >= 8) {
      intervention = `Je sens que la conversation monte. ${analysis.reformulation ? `Peut-être essayer : ${analysis.reformulation}` : 'Peut-être faire une courte pause ?'}`;
      type = 'warning';
    } else if (analysis.escaladeLevel >= 6 && analysis.reformulation) {
      intervention = `Je propose une reformulation : ${analysis.reformulation}`;
      type = 'reformulation';
    }

    return { intervention, type, shouldIntervene };
  }

  clearHistory() {
    this.conversationHistory = [];
  }
}

export const llmService = new LLMService();
