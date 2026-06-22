/**
 * RE:MEDY design tokens — 1:1 port of design_handoff_remedy/README.md §3.
 * All px values map directly to RN dp/pt (base frame 390 × 844).
 */

export const colors = {
  // backgrounds
  bgBase: '#100e1a',
  bgDeep: '#0d0b16', // player
  bgLogin: '#0c0a14',
  bgGradTop: '#241d33', // login top radial / app radial top

  // accents
  pink: '#ff8fb6',
  pinkSoft: '#ff9ec4',
  pinkDeep: '#ff7ea8',
  sky: '#7cc6ff',
  yellow: '#ffd86e',

  // text
  textPrimary: '#ffffff',
  textSecondary: 'rgba(255,255,255,0.55)',
  textTertiary: 'rgba(255,255,255,0.4)',

  // surfaces / borders
  card: 'rgba(255,255,255,0.04)',
  glass: 'rgba(22,18,32,0.62)',
  glassDock: 'rgba(24,20,36,0.72)',
  hairline: 'rgba(255,255,255,0.1)',
  hairlineSoft: 'rgba(255,255,255,0.08)',
  hairlineStrong: 'rgba(255,255,255,0.12)',

  // brand
  spotify: '#1db954',
  spotifyText: '#06351c',
  apple: '#fa243c',
  youtube: '#ff0000',

  // misc
  onAccent: '#2a1530', // dark text on pink CTAs
} as const;

/** Linear gradient color stops (consume with expo-linear-gradient). */
export const gradients = {
  /** 시그니처 — 드랍 버튼/주요 CTA. linear-gradient(135deg, ...) */
  signature: ['#ff9ec4', '#ffb3cf'] as const,
  /** 무지개 — 재생 progress / 전체재생. linear-gradient(90deg, ...) */
  rainbow: ['#ff9ec4', '#ffd86e', '#7cc6ff'] as const,
  rainbowLocations: [0, 0.5, 1] as const,
  /** segment / chip active */
  segment: ['#ff8fb6', '#ffb0c8'] as const,
  /** 전체재생 (playlist) */
  playlistPlay: ['#ff9ec4', '#ffd86e', '#7cc6ff'] as const,
  playlistPlayLocations: [0, 0.55, 1] as const,
  /** "me" avatar */
  meAvatar: ['#ffa6cb', '#c06fd8', '#8a6bff'] as const,
  meAvatarLocations: [0, 0.62, 1] as const,
  /** app background radial top→bottom (use AppBackground component) */
  appRadial: ['#241d33', '#120f1d', '#0a0812'] as const,
} as const;

/** 135deg diagonal start/end for expo-linear-gradient. */
export const DIAGONAL = { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } } as const;
/** 90deg horizontal start/end. */
export const HORIZONTAL = { start: { x: 0, y: 0 }, end: { x: 1, y: 0 } } as const;

export const radii = {
  chip: 22,
  pill: 28,
  card: 18,
  cardLg: 22,
  button: 16,
  input: 14,
  pin: 13,
  pinThumb: 11,
  dockPill: 32,
} as const;

export const spacing = {
  screenX: 24, // 화면 좌우 패딩 (22~24)
  screenXTight: 22,
} as const;

/** Font family names registered in App.tsx (see src/theme/fonts). */
export const font = {
  regular: 'Pretendard-Regular', // 400
  semibold: 'Pretendard-SemiBold', // 600
  bold: 'Pretendard-Bold', // 700
  extrabold: 'Pretendard-ExtraBold', // 800
  serif: 'GowunBatang_400Regular', // 400 (제목/세리프)
  serifBold: 'GowunBatang_700Bold', // 700
} as const;

/**
 * box-shadow strings — RN 0.85 (New Architecture) supports the `boxShadow`
 * style prop, so the design's multi-layer / spread / negative-offset shadows
 * port 1:1. Spread with rgba(accent) per README §3.
 */
export const shadows = {
  cta: '0 14px 30px -8px rgba(255,143,182,0.7)',
  ctaSoft: '0 12px 28px -8px rgba(255,143,182,0.65)',
  card: '0 10px 28px rgba(0,0,0,0.4)',
  pinkPin: (glow: string) => `0 6px 16px rgba(${glow},0.45)`,
  pinkPinActive: (glow: string) =>
    `0 0 0 3px rgba(${glow},0.4), 0 10px 24px rgba(${glow},0.6)`,
} as const;

export type ColorToken = keyof typeof colors;
