/**
 * Mock data — 1:1 with the prototype's SONGS / DROPS / COMMENTS / PLAYLISTS /
 * SERVICES (design/RE-MEDY.dc.html). Used for M1 (static UI) and as the
 * fallback/dev seed until the backend + Spotify are wired (see src/services).
 */
import type { Comment, Drop, Playlist, Service, Song } from '@/types';

export const SONGS: Record<string, Song> = {
  s1: { id: 's1', title: '늑대 향연', artist: '심규선', durationLabel: '3:12', durationMs: 192000, coverId: 's1' },
  s2: { id: 's2', title: '안개 속에서', artist: '유레', durationLabel: '4:05', durationMs: 245000, coverId: 's2' },
  s3: { id: 's3', title: '새벽 두 시', artist: '노을과', durationLabel: '3:48', durationMs: 228000, coverId: 's3' },
  s4: { id: 's4', title: '어떤 날', artist: '라일락', durationLabel: '2:57', durationMs: 177000, coverId: 's4' },
  s5: { id: 's5', title: '푸른 밤', artist: '해변의', durationLabel: '3:30', durationMs: 210000, coverId: 's5' },
  s6: { id: 's6', title: '0:00', artist: '무명', durationLabel: '4:22', durationMs: 262000, coverId: 's6' },
};

export const DROPS: Drop[] = [
  { id: 'd1', authorId: 'me', authorName: '서정현', songId: 's1', note: '날씨가 추워요, 감기 조심', address: '부산광역시 사상구 괘법동 550-13', locationLabel: '사상구 괘법동', likeCount: 12, liked: false, commentCount: 3, createdAt: '2026-01-01T09:00:00+09:00', dateLabel: '2026년 1월 1일', distanceLabel: '바로 여기', lat: 35.1601, lng: 128.9899, mapX: 57, mapY: 55, active: true },
  { id: 'd2', authorId: 'u2', authorName: '유나', songId: 's3', note: '이 길을 걸을 땐 늘 이 노래', address: '부산광역시 사상구 학장동', locationLabel: '사상구 학장동', likeCount: 8, liked: true, commentCount: 1, createdAt: '2025-12-30T18:00:00+09:00', dateLabel: '2025년 12월 30일', distanceLabel: '180m', lat: 35.1556, lng: 128.9802, mapX: 30, mapY: 62, active: true },
  { id: 'd3', authorId: 'u3', authorName: '도윤', songId: 's4', note: '버스 정류장에서', address: '부산광역시 사상구 감전동', locationLabel: '사상구 감전동', likeCount: 5, liked: false, commentCount: 0, createdAt: '2025-12-28T20:00:00+09:00', dateLabel: '2025년 12월 28일', distanceLabel: '240m', lat: 35.1648, lng: 128.9821, mapX: 70, mapY: 38, active: true },
  { id: 'd4', authorId: 'u4', authorName: 'KAI', songId: 's2', note: '밤공기 좋다', address: '부산광역시 사상구 주례동', locationLabel: '사상구 주례동', likeCount: 21, liked: false, commentCount: 4, createdAt: '2025-12-27T22:00:00+09:00', dateLabel: '2025년 12월 27일', distanceLabel: '1.4km', lat: 35.1538, lng: 128.9905, mapX: 38, mapY: 26, active: false },
  { id: 'd5', authorId: 'u5', authorName: '민', songId: 's5', note: '여기서 바다가 보였으면', address: '부산광역시 사상구 모라동', locationLabel: '사상구 모라동', likeCount: 3, liked: false, commentCount: 0, createdAt: '2025-12-20T15:00:00+09:00', dateLabel: '2025년 12월 20일', distanceLabel: '2.1km', lat: 35.1889, lng: 128.9912, mapX: 66, mapY: 72, active: false },
  { id: 'd6', authorId: 'u6', authorName: '서아', songId: 's6', note: '', address: '부산광역시 사상구 덕포동', locationLabel: '사상구 덕포동', likeCount: 7, liked: false, commentCount: 0, createdAt: '2025-12-18T11:00:00+09:00', dateLabel: '2025년 12월 18일', distanceLabel: '2.6km', lat: 35.1727, lng: 128.9818, mapX: 22, mapY: 30, active: false },
];

export const COMMENTS: Comment[] = [
  { id: 'c1', dropId: 'd1', authorName: '유나', dateLabel: '1월 1일', text: '저도 이 자리 자주 지나가요. 노래 좋네요!' },
  { id: 'c2', dropId: 'd1', authorName: '도윤', dateLabel: '12월 31일', text: '겨울에 딱 맞는 곡이에요 🤍' },
  { id: 'c3', dropId: 'd1', authorName: 'KAI', dateLabel: '12월 30일', text: '플레이리스트에 담아갑니다' },
];

export const PLAYLISTS: Playlist[] = [
  { id: 'pl1', ownerName: '서정현', name: '늦은 밤 산책', songCount: 18, totalDurationLabel: '1시간 9분', songIds: ['s1', 's3', 's2', 's5', 's6', 's4'] },
  { id: 'pl2', ownerName: '서정현', name: '비 오는 날', songCount: 9, totalDurationLabel: '34분', songIds: ['s3', 's4', 's1', 's2'] },
  { id: 'pl3', ownerName: '서정현', name: '드라이브', songCount: 32, totalDurationLabel: '2시간 2분', songIds: ['s5', 's6', 's1', 's3'] },
  { id: 'pl4', ownerName: '서정현', name: '위로가 필요할 때', songCount: 14, totalDurationLabel: '52분', songIds: ['s2', 's1', 's4', 's5'] },
];

export const SERVICES: Service[] = [
  { id: 'spotify', name: 'Spotify', shortName: 'Spotify', color: '#1db954' },
  { id: 'apple', name: 'Apple Music', shortName: 'Apple', color: '#fa243c' },
  { id: 'youtube', name: 'YouTube Music', shortName: 'YouTube', color: '#ff0000' },
];

/** Current user's liked songs (Profile → 좋아요 tab). */
export const LIKED_SONG_IDS = ['s1', 's3', 's5', 's2'];

export const ME = {
  id: 'me',
  displayName: '서정현',
  email: 'hyeonsu0809@gmail.com',
} as const;

// ---- accessors -------------------------------------------------------------

export const getSong = (id: string): Song =>
  SONGS[id] ?? { id, title: '알 수 없는 곡', artist: '', coverId: id };

export const getDrop = (id: string): Drop | undefined => DROPS.find((d) => d.id === id);

export const getPlaylist = (id: string): Playlist | undefined =>
  PLAYLISTS.find((p) => p.id === id);

export const getCommentsFor = (dropId: string): Comment[] =>
  COMMENTS.filter((c) => c.dropId === dropId);
