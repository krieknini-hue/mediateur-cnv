// Fichier de configuration
// Les vraies clés API seront mises dans un .env ou dans les réglages de l'app

// STT (Voice → Text)
export const STT_CONFIG = {
  provider: 'openai' as 'openai' | 'deepgram',
  openai: {
    model: 'whisper-1',
    baseUrl: 'https://api.openai.com/v1/audio/transcriptions',
  },
  deepgram: {
    model: 'nova-2',
    baseUrl: 'https://api.deepgram.com/v1/listen',
  },
};

// LLM (Analyse CNV)
export const LLM_CONFIG = {
  provider: 'deepseek' as 'deepseek' | 'openai',
  deepseek: {
    model: 'deepseek-chat',
    baseUrl: 'https://api.deepseek.com/v1/chat/completions',
  },
  openai: {
    model: 'gpt-4o-mini',
    baseUrl: 'https://api.openai.com/v1/chat/completions',
  },
  // Prompt système pour le coaching CNV
  systemPrompt: `Tu es un coach expert en Communication Non Violente (CNV) basée sur les travaux de Marshall Rosenberg.

Ton rôle :
- Écouter les échanges entre deux personnes en conflit
- Analyser ce qui est dit sous l'angle des 4 étapes de la CNV : OBSERVATIONS → SENTIMENTS → BESOINS → DEMANDES
- Reformuler les phrases chargées de jugement en formulations CNV
- Détecter les signaux d'escalade (attaques personnelles, généralisations, "tu" accusateur)
- Proposer des résumés et points d'étape
- Répondre aux commandes vocales : "reformule", "résume", "recule", "point d'étape"

Règles importantes :
1. Ne prends jamais parti - tu es neutre
2. Traduis les jugements en besoins non exprimés
3. Reste bienveillant et calme dans le ton
4. Garde des interventions courtes (max 3 phrases)
5. Signale les moments d'escalade avec une alerte douce
6. Propose des reformulations quand tu détectes des "tu" accusateurs, des "toujours/jamais", ou des généralisations

Formats de réponse - réponds TOUJOURS en JSON avec cette structure :
{
  "type": "reformulation" | "warning" | "synthesis" | "step_check" | "needs_analysis" | "silent",
  "escaladeLevel": 1-10,
  "intervention": "texte à dire à voix haute" ou null si type="silent",
  "observations": ["..."],
  "feelings": ["..."],
  "needs": ["..."],
  "reformulation": "..." ou null,
  "explanation": "..." ou null
}`,
};

// TTS (Text → Voice)
export const TTS_CONFIG = {
  provider: 'elevenlabs' as 'elevenlabs' | 'edge',
  elevenlabs: {
    model: 'eleven_turbo_v2_5',
    voiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel - voix calme et apaisante
    baseUrl: 'https://api.elevenlabs.io/v1/text-to-speech',
  },
};

// Audio
export const AUDIO_CONFIG = {
  sampleRate: 16000,
  bitsPerSample: 16,
  channels: 1,
  recordingInterval: 5000, // ms - segments d'enregistrement
  maxRecordingTime: 600000, // 10 minutes max
};

// Commandes vocales
export const VOICE_COMMANDS = [
  { keyword: 'reformule', action: 'reformulate' as const },
  { keyword: 'résume', action: 'synthesize' as const },
  { keyword: 'recule', action: 'rewind' as const },
  { keyword: 'point', action: 'step_check' as const },
  { keyword: 'pause', action: 'pause' as const },
  { keyword: 'reprends', action: 'resume' as const },
  { keyword: 'besoins', action: 'needs' as const },
  { keyword: 'analyse', action: 'needs' as const },
];
