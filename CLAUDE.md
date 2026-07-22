# Médiateur CNV

Application mobile React Native / Expo pour un coaching en Communication Non Violente (CNV).

## Stack

- **Framework**: React Native + Expo SDK 57
- **Langage**: TypeScript
- **Audio**: expo-av (enregistrement + playback)
- **STT**: OpenAI Whisper API
- **LLM**: DeepSeek (prompt CNV spécialisé)
- **TTS**: ElevenLabs

## Structure

```
App.tsx                          # Point d'entrée
src/
├── screens/
│   ├── HomeScreen.tsx           # Écran d'accueil + config API
│   └── SessionScreen.tsx        # Écran de session coaching
├── services/
│   ├── audioService.ts          # Enregistrement / playback audio
│   ├── sttService.ts            # Speech-to-text (Whisper)
│   ├── llmService.ts            # Analyse CNV (DeepSeek)
│   └── ttsService.ts            # Text-to-speech (ElevenLabs)
├── hooks/
│   └── useSession.ts            # Hook principal de session
├── constants/
│   ├── config.ts                # Configuration API + prompts
│   └── theme.ts                 # Couleurs, espacements, polices
└── types/
    └── index.ts                 # Types TypeScript
```

## Commandes

```bash
npm start              # Démarrer Expo
npm run android        # Build Android
npm run ios            # Build iOS (macOS)
npx tsc --noEmit       # Vérifier TypeScript
```

## Flow utilisateur

1. Accueil → configurer ses clés API
2. Démarrer une session → pose le téléphone
3. Le coach écoute, analyse, intervient vocalement
4. Commandes : reformule, résumé, besoins, point d'étape
