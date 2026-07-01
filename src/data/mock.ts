/**
 * Static UI config that isn't backed by the API. Domain data (songs, drops,
 * playlists, likes, profile) now comes from REMEDY-BACK-V3 via services/backend.
 * Only the streaming-service catalog (Settings 재생 서비스 tiles) lives here.
 */
import type { Service } from '@/types';

export const SERVICES: Service[] = [
  { id: 'spotify', name: 'Spotify', shortName: 'Spotify', color: '#1db954' },
  { id: 'apple', name: 'Apple Music', shortName: 'Apple', color: '#fa243c' },
  { id: 'youtube', name: 'YouTube Music', shortName: 'YouTube', color: '#ff0000' },
];
