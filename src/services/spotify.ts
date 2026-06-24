/**
 * Spotify integration (INTEGRATION.md §2).
 *  - Auth: Authorization Code + PKCE via expo-auth-session
 *  - Tokens: expo-secure-store (access/refresh, with expiry refresh)
 *  - Search / metadata: Web API
 *  - Playback: react-native-spotify-remote (native, added in M3 dev build) with
 *    an expo-audio preview_url fallback.
 *
 * M1 status: auth/search are wired against config.spotifyClientId; once a real
 * Client ID + Redirect URI are set (app.json extra + Spotify dashboard), the
 * Login screen can call `buildAuthRequestConfig()` with expo-auth-session.
 */
import * as SecureStore from 'expo-secure-store';
import * as AuthSession from 'expo-auth-session';
import type { Song } from '@/types';
import { config } from '@/services/config';

export const SPOTIFY_SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-read-playback-state',
  'user-modify-playback-state',
  'playlist-read-private',
  'user-library-read',
  'user-library-modify',
];

export const SPOTIFY_DISCOVERY: AuthSession.DiscoveryDocument = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

const KEY_ACCESS = 'spotify_access_token';
const KEY_REFRESH = 'spotify_refresh_token';
const KEY_EXPIRES = 'spotify_expires_at';

// Must exactly match a Redirect URI registered in the Spotify dashboard.
export const spotifyRedirectUri = AuthSession.makeRedirectUri({ scheme: 'remedy', path: 'auth-callback' });

/** Config for `useAuthRequest` in a screen (PKCE). */
export function buildAuthRequestConfig(): AuthSession.AuthRequestConfig {
  return {
    clientId: config.spotifyClientId,
    scopes: SPOTIFY_SCOPES,
    usePKCE: true,
    redirectUri: spotifyRedirectUri,
    responseType: AuthSession.ResponseType.Code,
  };
}

/** Exchange the PKCE authorization code for access/refresh tokens, persist them. */
export async function exchangeCodeForToken(code: string, codeVerifier: string): Promise<boolean> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: spotifyRedirectUri,
    client_id: config.spotifyClientId,
    code_verifier: codeVerifier,
  });
  const res = await fetch(SPOTIFY_DISCOVERY.tokenEndpoint!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  if (!res.ok) return false;
  const json = (await res.json()) as { access_token: string; refresh_token?: string; expires_in: number };
  await storeTokens({
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    expiresIn: json.expires_in,
  });
  return true;
}

/** Whether a Spotify user access token is currently stored. */
export async function isSpotifyAuthed(): Promise<boolean> {
  return (await SecureStore.getItemAsync(KEY_ACCESS)) != null;
}

// ---- app token (Client Credentials) ----------------------------------------
// Login-free token for catalog/search (no user context). The secret lives in
// app config (no backend) — see services/config.ts. Cached in memory until it
// nears expiry. A backend proxy is the production-safe alternative.

let appToken: string | null = null;
let appTokenExpiresAt = 0;

export async function getAppToken(): Promise<string | null> {
  if (!config.spotifyClientSecret) return null;
  if (appToken && Date.now() < appTokenExpiresAt - 30_000) return appToken;
  try {
    const res = await fetch(SPOTIFY_DISCOVERY.tokenEndpoint!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: config.spotifyClientId,
        client_secret: config.spotifyClientSecret,
      }).toString(),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { access_token: string; expires_in: number };
    appToken = json.access_token;
    appTokenExpiresAt = Date.now() + json.expires_in * 1000;
    return appToken;
  } catch {
    return null;
  }
}

// ---- token storage ---------------------------------------------------------

export async function storeTokens(t: { accessToken: string; refreshToken?: string; expiresIn?: number }) {
  await SecureStore.setItemAsync(KEY_ACCESS, t.accessToken);
  if (t.refreshToken) await SecureStore.setItemAsync(KEY_REFRESH, t.refreshToken);
  if (t.expiresIn) {
    await SecureStore.setItemAsync(KEY_EXPIRES, String(Date.now() + t.expiresIn * 1000));
  }
}

export async function clearTokens() {
  await Promise.all([
    SecureStore.deleteItemAsync(KEY_ACCESS),
    SecureStore.deleteItemAsync(KEY_REFRESH),
    SecureStore.deleteItemAsync(KEY_EXPIRES),
  ]);
}

async function getAccessTokenRaw(): Promise<string | null> {
  return SecureStore.getItemAsync(KEY_ACCESS);
}

/** Returns a valid access token, refreshing if expired. */
export async function getValidAccessToken(): Promise<string | null> {
  const token = await getAccessTokenRaw();
  const expiresAt = Number((await SecureStore.getItemAsync(KEY_EXPIRES)) ?? 0);
  if (token && Date.now() < expiresAt - 30_000) return token;
  return refreshAccessToken();
}

export async function refreshAccessToken(): Promise<string | null> {
  const refresh = await SecureStore.getItemAsync(KEY_REFRESH);
  if (!refresh) return null;
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refresh,
    client_id: config.spotifyClientId,
  });
  const res = await fetch(SPOTIFY_DISCOVERY.tokenEndpoint!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { access_token: string; refresh_token?: string; expires_in: number };
  await storeTokens({
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    expiresIn: json.expires_in,
  });
  return json.access_token;
}

// ---- web api ---------------------------------------------------------------

interface SpotifyTrack {
  id: string;
  uri: string;
  name: string;
  duration_ms: number;
  preview_url: string | null;
  external_ids?: { isrc?: string };
  artists: { name: string }[];
  album: { images: { url: string }[] };
}

export function trackToSong(t: SpotifyTrack): Song {
  return {
    id: t.id,
    provider: 'spotify',
    providerTrackId: t.uri,
    isrc: t.external_ids?.isrc,
    title: t.name,
    artist: t.artists.map((a) => a.name).join(', '),
    durationMs: t.duration_ms,
    artworkUrl: t.album.images[0]?.url,
    previewUrl: t.preview_url ?? undefined,
  };
}

/**
 * Drop step 1 search (INTEGRATION.md §2-3). Uses the app token (Client
 * Credentials) so search works without a user login. Returns [] on no token /
 * empty query / error — the screen falls back to the mock catalog.
 */
export async function searchTracks(query: string, limit = 20): Promise<Song[]> {
  if (!query.trim()) return [];
  const token = await getAppToken();
  if (!token) return [];
  const url = `https://api.spotify.com/v1/search?type=track&limit=${limit}&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) return [];
  const json = (await res.json()) as { tracks: { items: SpotifyTrack[] } };
  return json.tracks.items.map(trackToSong);
}

// ---- playback (M3) ---------------------------------------------------------

/**
 * Playback contract the player UI binds to. M3 implements this with
 * react-native-spotify-remote (Premium) + an expo-audio preview fallback.
 * For now it's a no-op so the UI's optimistic play/pause still works.
 */
export interface PlaybackController {
  play(uri: string): Promise<void>;
  resume(): Promise<void>;
  pause(): Promise<void>;
  seek(ms: number): Promise<void>;
  next(): Promise<void>;
  previous(): Promise<void>;
}

export const noopPlayback: PlaybackController = {
  async play() {},
  async resume() {},
  async pause() {},
  async seek() {},
  async next() {},
  async previous() {},
};
