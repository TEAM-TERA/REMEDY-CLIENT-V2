/**
 * Backend client for drops / comments / profile (DATA_MODEL.md §2).
 * M4 wires these to the real API; until then `USE_MOCK` serves the seed data
 * so the app is fully navigable offline. Flip USE_MOCK to false (and set a real
 * apiBaseUrl + session token) to go live.
 */
import type { Comment, Drop, Playlist, Song } from '@/types';
import { config } from '@/services/config';
import {
  COMMENTS,
  DROPS,
  LIKED_SONG_IDS,
  PLAYLISTS,
  SONGS,
  getCommentsFor,
  getDrop,
  getPlaylist,
  getSong,
} from '@/data/mock';

export const USE_MOCK = true;

let sessionToken: string | null = null;
export function setSessionToken(t: string | null) {
  sessionToken = t;
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${config.apiBaseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return (await res.json()) as T;
}

// ---- reads -----------------------------------------------------------------

export async function getNearbyDrops(lat: number, lng: number, radius = 2000): Promise<Drop[]> {
  if (USE_MOCK) return DROPS;
  return api<Drop[]>(`/drops?lat=${lat}&lng=${lng}&radius=${radius}`);
}

export async function fetchDrop(id: string): Promise<Drop | undefined> {
  if (USE_MOCK) return getDrop(id);
  return api<Drop>(`/drops/${id}`);
}

export async function fetchComments(dropId: string): Promise<Comment[]> {
  if (USE_MOCK) return getCommentsFor(dropId);
  return api<Comment[]>(`/drops/${dropId}/comments`);
}

export async function fetchMyDrops(): Promise<Drop[]> {
  if (USE_MOCK) return DROPS;
  return api<Drop[]>(`/me/drops`);
}

export async function fetchMyPlaylists(): Promise<Playlist[]> {
  if (USE_MOCK) return PLAYLISTS;
  return api<Playlist[]>(`/me/playlists`);
}

export async function fetchPlaylist(id: string): Promise<Playlist | undefined> {
  if (USE_MOCK) return getPlaylist(id);
  return api<Playlist>(`/playlists/${id}`);
}

export async function fetchMyLikes(): Promise<Song[]> {
  if (USE_MOCK) return LIKED_SONG_IDS.map(getSong);
  return api<Song[]>(`/me/likes`);
}

export function resolveSong(songId: string): Song {
  // mock helper used by list rows that only store songId
  return SONGS[songId] ?? getSong(songId);
}

// ---- writes ----------------------------------------------------------------

export interface CreateDropInput {
  songId: string;
  note: string;
  lat: number;
  lng: number;
}

export async function createDrop(input: CreateDropInput): Promise<{ id: string }> {
  if (USE_MOCK) return { id: `d${Date.now()}` };
  return api<{ id: string }>(`/drops`, { method: 'POST', body: JSON.stringify(input) });
}

export async function likeDrop(id: string, like: boolean): Promise<void> {
  if (USE_MOCK) return;
  await api(`/drops/${id}/like`, { method: like ? 'POST' : 'DELETE' });
}

export async function postComment(dropId: string, text: string): Promise<Comment> {
  if (USE_MOCK) {
    return { id: `c${Date.now()}`, dropId, authorName: 'CHS', text, dateLabel: '방금' };
  }
  return api<Comment>(`/drops/${dropId}/comments`, { method: 'POST', body: JSON.stringify({ text }) });
}
