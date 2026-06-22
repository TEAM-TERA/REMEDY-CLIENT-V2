/**
 * Gradient cover/album-art fallback palettes (README §3 "곡 커버").
 * 3 colors (a, b, c) feed the 3-layer radial-gradient rendered by <SongCover>.
 * In production these are the fallback when Song.artworkUrl is absent.
 */

export type CoverPalette = readonly [string, string, string];

export const COVER_PALETTES: Record<string, CoverPalette> = {
  s1: ['#ff7ea8', '#8e0b3a', '#2a0512'],
  s2: ['#b76bff', '#4a1a8a', '#1a0a33'],
  s3: ['#3f7bff', '#11337a', '#050b1c'],
  s4: ['#ff7eb0', '#b23a6b', '#2a0a1c'],
  s5: ['#28d6c0', '#0e6e74', '#04201f'],
  s6: ['#ffb24d', '#b5591a', '#241004'],
};

const FALLBACK: CoverPalette = ['#ff7ea8', '#8e0b3a', '#2a0512'];

/** Deterministic palette for an arbitrary id (so unknown songs still render). */
export function coverFor(id: string | undefined): CoverPalette {
  if (id && COVER_PALETTES[id]) return COVER_PALETTES[id];
  if (!id) return FALLBACK;
  let h = 0;
  for (let i = 0; i < id.length; i++) h = id.charCodeAt(i) + ((h << 5) - h);
  const keys = Object.keys(COVER_PALETTES);
  return COVER_PALETTES[keys[Math.abs(h) % keys.length]];
}

/** Avatar gradient palettes (README / prototype avatar() hash). */
export const AVATAR_PALETTES: ReadonlyArray<readonly [string, string]> = [
  ['#ff7eb0', '#b23a6b'],
  ['#b76bff', '#4a1a8a'],
  ['#3f7bff', '#11337a'],
  ['#28d6c0', '#0e6e74'],
  ['#ffb24d', '#b5591a'],
  ['#ff7ea8', '#8e0b3a'],
];

export function avatarPalette(name: string): readonly [string, string] {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_PALETTES[Math.abs(h) % AVATAR_PALETTES.length];
}
