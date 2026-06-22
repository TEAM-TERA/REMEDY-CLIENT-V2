/**
 * RE:MEDY data contracts — port of design_handoff_remedy/DATA_MODEL.md.
 * These are the shapes the UI consumes; the service layer (src/services)
 * maps Spotify / backend responses into these.
 */

export type ServiceId = 'spotify' | 'apple' | 'youtube';

export interface User {
  id: string;
  displayName: string; // "CHS"
  email: string;
  avatarUrl?: string; // absent → gradient fallback from displayName
  defaultService: ServiceId;
  connectedServices: ServiceId[];
  mapVariant: 0 | 1;
  createdAt: string;
}

export interface Song {
  id: string;
  provider?: ServiceId;
  providerTrackId?: string; // e.g. spotify:track:...
  isrc?: string; // cross-service mapping key
  title: string;
  artist: string;
  durationMs?: number;
  durationLabel?: string; // "3:12" (UI may format from durationMs)
  artworkUrl?: string; // Spotify album.images[0]; absent → gradient fallback
  previewUrl?: string; // 30s preview (Free / fallback)
  /** local-only: which gradient fallback palette to use (s1..s6) */
  coverId?: string;
}

export interface Drop {
  id: string;
  authorId: string;
  authorName: string; // denormalized for list rendering
  songId: string;
  note: string; // 0~200 chars, may be empty
  lat: number;
  lng: number;
  address: string; // reverse-geocoded full address
  locationLabel: string; // "사상구 괘법동"
  likeCount: number;
  liked: boolean; // for current user
  commentCount: number;
  createdAt: string; // ISO
  dateLabel: string; // "2026년 1월 1일"
  distanceLabel: string; // computed: "바로 여기" / "180m" / "1.4km"
  /** prototype map placement (% of frame) — used by the M1 SVG abstract map */
  mapX: number;
  mapY: number;
  /** active = nearby framed pin; otherwise dim square dot */
  active: boolean;
}

export interface Comment {
  id: string;
  dropId: string;
  authorName: string;
  text: string;
  dateLabel: string; // "1월 1일"
}

export interface Playlist {
  id: string;
  ownerName: string; // "CHS"
  name: string;
  songCount: number;
  totalDurationLabel: string; // "1시간 9분"
  coverSongId?: string;
  songIds: string[];
}

export interface Service {
  id: ServiceId;
  name: string; // full label, e.g. "Apple Music"
  shortName: string; // "Apple"
  color: string;
}

/** Distance formatting per DATA_MODEL §3. */
export function formatDistance(meters: number): string {
  if (meters < 10) return '바로 여기';
  if (meters < 1000) return `${Math.round(meters / 10) * 10}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

/** durationMs → "m:ss" (or "mm:ss" when padMinutes, matching the player). */
export function formatDuration(ms: number, padMinutes = false): string {
  const total = Math.round(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  const mm = padMinutes ? String(m).padStart(2, '0') : String(m);
  return `${mm}:${String(s).padStart(2, '0')}`;
}
