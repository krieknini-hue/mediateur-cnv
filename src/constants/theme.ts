export const Colors = {
  // Palette principale - tons apaisants
  primary: '#4A90D9',          // Bleu calme
  primaryLight: '#7BB3F0',
  primaryDark: '#2C6FBD',

  // Feedback
  success: '#5CB85C',          // Vert écoute
  warning: '#F0AD4E',          // Jaune attention
  danger: '#D9534F',           // Rouge escalade
  info: '#5BC0DE',             // Bleu info

  // Neutres
  background: '#F7F8FA',
  surface: '#FFFFFF',
  surfaceAlt: '#F0F2F5',
  text: '#2D3436',
  textSecondary: '#636E72',
  textLight: '#B2BEC3',
  border: '#DFE6E9',
  divider: '#E8ECF1',

  // États coaching
  listening: '#5CB85C',        // Vert - écoute active
  processing: '#F0AD4E',       // Jaune - analyse en cours
  speaking: '#4A90D9',         // Bleu - le coach parle
  paused: '#B2BEC3',           // Gris - pause
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const FontSize = {
  caption: 12,
  body: 16,
  bodyLarge: 18,
  subtitle: 20,
  title: 24,
  titleLarge: 28,
  hero: 36,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;
