# 🌸 Médiateur CNV

**Coach personnel en Communication Non Violente (CNV)**

Une application mobile qui écoute vos conversations et vous guide vers une communication plus bienveillante — basée sur les travaux de Marshall Rosenberg.

## ✨ Fonctionnalités

- 🎤 **Écoute active** — posez votre téléphone, le coach capte la conversation
- 🧠 **Analyse CNV en temps réel** — reformulation, détection des besoins, niveau d'escalade
- 🔊 **Interventions vocales** — le coach vous parle via la synthèse vocale native
- 👤 **Locuteur A/B** — attribution automatique des répliques
- 🎯 **Commandes rapides** — Reformule, Résumé, Besoins, Point d'étape
- 🔍 **Bouton Analyser** — analyser le dernier échange sur demande
- 🔒 **Zéro configuration** — fonctionne directement, aucune clé API requise

## 📲 Installation

### Android (APK)

1. Téléchargez la dernière APK depuis les [Releases](https://github.com/krieknini-hue/mediateur-cnv/releases)
2. Ouvrez le fichier APK sur votre téléphone
3. Autorisez l'installation depuis des sources inconnues si demandé
4. Lancez l'app — tout est prêt

### iOS

L'app est disponible via Expo. Contactez le développeur pour accéder au build iOS.

## 🛠️ Développement

### Prérequis

- Node.js 22+ 
- Expo CLI (`npx expo`)
- EAS CLI (`npm install -g eas-cli`)

### Installation

```bash
git clone https://github.com/krieknini-hue/mediateur-cnv.git
cd mediateur-cnv
npm install
```

### Build APK (cloud)

```bash
npx eas build --platform android --profile preview
```

### Build local

```bash
npx expo run:android
```

## 🏗️ Architecture

```
App.tsx                          # Point d'entrée
src/
├── screens/
│   ├── HomeScreen.tsx           # Écran d'accueil
│   └── SessionScreen.tsx        # Session coaching en direct
├── services/
│   ├── audioService.ts          # Enregistrement audio (expo-av)
│   ├── llmService.ts            # Analyse CNV via proxy DeepSeek
│   ├── sttService.ts            # Speech-to-text (via proxy)
│   └── ttsService.ts            # Synthèse vocale native (expo-speech)
├── hooks/
│   └── useSession.ts            # Logique métier de la session
├── constants/
│   ├── config.ts                # URL du proxy + prompt CNV
│   └── theme.ts                 # Design system
└── types/
    └── index.ts                 # Types TypeScript
```

### Serveur Proxy

```
VPS (proxy) ── HTTP ──► App mobile
    │
    └──► DeepSeek API (LLM CNV)
```

Le proxy est hébergé sur un VPS et fait le pont entre l'app et DeepSeek. Aucune clé API n'est exposée aux utilisateurs.

## 🔧 Stack Technique

| Composant | Technologie |
|-----------|------------|
| Framework | React Native / Expo SDK 57 |
| Langage | TypeScript |
| LLM | DeepSeek (via proxy) |
| Audio | expo-av |
| TTS | expo-speech (synthèse native) |
| Build | EAS Build |

## 📄 Licence

MIT
