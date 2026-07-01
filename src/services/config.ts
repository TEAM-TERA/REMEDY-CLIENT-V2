/**
 * Runtime config. The backend (REMEDY-BACK-V3) now owns Spotify search/metadata,
 * so the app no longer needs a Spotify secret in the bundle — search goes through
 * `GET /songs/search`. Only the Google Maps key (consumed by app.config.js at
 * prebuild) and the API base URL remain client config.
 *
 * `EXPO_PUBLIC_*` vars are inlined into the JS bundle by Metro at build time, so
 * they work in dev (after a Metro restart to pick up `.env`) without a native
 * rebuild.
 */
import { Platform } from 'react-native';

/**
 * Default API base URL per platform when EXPO_PUBLIC_API_BASE_URL is unset:
 *  - Android emulator reaches the host machine via the 10.0.2.2 alias.
 *  - iOS simulator shares the host loopback, so localhost works.
 * A physical device needs the dev machine's LAN IP — set EXPO_PUBLIC_API_BASE_URL.
 */
const DEFAULT_API_BASE =
  Platform.OS === 'android' ? 'http://10.0.2.2:4000/api/v1' : 'http://localhost:4000/api/v1';

export const config = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE,
};
