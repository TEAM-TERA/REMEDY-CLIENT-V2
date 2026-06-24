/**
 * Runtime config — Spotify credentials + Google Maps key come from the
 * environment (`.env`, which is gitignored). NEVER hardcode them here.
 *
 * `EXPO_PUBLIC_*` vars are inlined into the JS bundle by Metro at build time, so
 * they work in dev (after a Metro restart to pick up `.env`) without a native
 * rebuild. The Google Maps key is consumed by app.config.js at prebuild time.
 *
 * ⚠️ A no-backend Client Credentials secret necessarily ends up in the app
 * bundle. Restrict the app / move the secret to a backend proxy before any
 * public release. See .env.example / INTEGRATION_KEYS.md.
 */
export const config = {
  spotifyClientId: process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID ?? '',
  spotifyClientSecret: process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET ?? '',
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://api.remedy.example.com',
};

export const spotifyConfigured = config.spotifyClientId.length > 0;
/** Client Credentials (app token) available → login-free Spotify search. */
export const spotifySearchConfigured = spotifyConfigured && config.spotifyClientSecret.length > 0;
