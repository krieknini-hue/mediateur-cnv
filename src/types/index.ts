// Types principaux de l'application Médiateur CNV

export type SessionStatus = 'idle' | 'listening' | 'processing' | 'speaking' | 'paused';

export type SpeakerLabel = 'user_1' | 'user_2' | 'unknown';

export interface TranscriptSegment {
  id: string;
  speaker: SpeakerLabel;
  text: string;
  timestamp: number; // ms depuis le début de la session
}

export interface CoachIntervention {
  id: string;
  type: 'warning' | 'reformulation' | 'synthesis' | 'stepback' | 'needs_analysis';
  originalText: string;
  suggestedText: string;
  explanation: string;
  timestamp: number;
}

export interface Session {
  id: string;
  title: string;
  startedAt: Date;
  endedAt?: Date;
  transcript: TranscriptSegment[];
  interventions: CoachIntervention[];
  notes?: string;
}

export interface CNVAnalysis {
  observations: string[];            // Faits observables
  feelings: string[];                // Sentiments détectés
  needs: string[];                   // Besoins sous-jacents
  requests: string[];                // Demandes potentielles
  escaladeLevel: number;             // 1-10
  reformulation?: string;            // Reformulation CNV
  synthesis?: string;                // Synthèse
}

export interface VoiceCommand {
  keyword: string;
  action: VoiceCommandAction;
}

export type VoiceCommandAction =
  | 'reformulate'
  | 'synthesize'
  | 'rewind'
  | 'pause'
  | 'resume'
  | 'status'
  | 'needs'
  | 'step_check';

// === Nouveau format de sortie LLM ===

export type EscalationLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface DetectedNeeds {
  speaker_A: string | null;
  speaker_B: string | null;
}

export interface LLMOutput {
  should_speak: boolean;
  escalation_level: EscalationLevel;
  detected_needs: DetectedNeeds;
  spoken_response: string; // Texte court max 35 mots
}
