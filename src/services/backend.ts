/**
 * Typed client for every REMEDY-BACK-V3 endpoint + mappers into the UI types
 * (Drop / Song / Comment / Playlist / AppNotification). The screens/stores call
 * these; the low-level HTTP + auth lives in services/api.ts.
 *
 * Backend quirks baked in here (see backend-api-contract):
 *  - POST create endpoints return 201 VOID → re-fetch to get the new row.
 *  - 409 DROPPING_ALREADY_EXISTS when a new drop is too close to an existing one.
 *  - songs persist only via drop creation (ensureSongs); search is ephemeral.
 *  - GET /users has no email/id; my-like returns only droppingIds.
 */
import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '@/services/api';
import {
  formatDistance,
  type AppNotification,
  type Comment,
  type Drop,
  type DropType,
  type NotificationType,
  type Playlist,
  type Song,
} from '@/types';
import type { Coords } from '@/services/location';

// ── backend response shapes ─────────────────────────────────────────────────

interface SongSearchItem {
  id: string;
  title: string;
  artist: string;
  album?: string | null;
  albumImagePath: string;
}
interface SongSearchResponse {
  songSearchResponses: SongSearchItem[];
}
interface PlayLinks {
  spotify?: { available: boolean; url?: string };
  youtube?: { available: boolean; url?: string };
}
interface SongResponse {
  id: string;
  title: string;
  artist: string;
  album?: string | null;
  duration: number;
  albumImagePath: string;
  playLinks?: PlayLinks;
}

interface DropSearchItemBase {
  type: DropType;
  droppingId: string;
  userId: number;
  content: string | null;
  latitude: number;
  longitude: number;
  address: string | null;
  isMyDropping: boolean;
}
interface MusicSearchItem extends DropSearchItemBase {
  type: 'MUSIC';
  songId: string;
  title: string;
  artist: string;
  albumImageUrl: string;
}
interface VoteSearchItem extends DropSearchItemBase {
  type: 'VOTE';
  topic: string;
  options: string[];
  firstAlbumImageUrl: string;
}
interface PlaylistSearchItem extends DropSearchItemBase {
  type: 'PLAYLIST';
  playlistName: string;
  songIds: string[];
  firstAlbumImageUrl: string;
}
type DropSearchItem = MusicSearchItem | VoteSearchItem | PlaylistSearchItem;
interface DropSearchListResponse {
  droppings: DropSearchItem[];
}

interface MusicDropDetail {
  droppingId: string;
  songId: string;
  userId: number;
  username: string;
  content: string | null;
  expiryDate: string;
  createdAt: string;
  albumImageUrl: string;
  playLinks?: PlayLinks;
}
export interface VoteOption {
  songId: string;
  albumImagePath: string;
  title: string;
  artist: string;
  voteCount: number;
  playLinks?: PlayLinks;
}
export interface VoteDropDetail {
  droppingId: string;
  userId: number;
  topic: string;
  options: VoteOption[];
  content: string | null;
  latitude: number;
  longitude: number;
  address: string | null;
  expiryDate: string;
  createdAt: string;
  totalVotes: number;
  userVotedOption: string | null;
}
interface PlaylistDropSongInfo {
  songId: string;
  title: string;
  artist: string;
  albumImagePath: string;
  playLinks?: PlayLinks;
}
export interface PlaylistDropDetail {
  droppingId: string;
  userId: number;
  playlistName: string;
  songs: PlaylistDropSongInfo[];
  content: string | null;
  latitude: number;
  longitude: number;
  address: string | null;
  expiryDate: string;
  createdAt: string;
}

interface ProfileResponse {
  username: string;
  profileImageUrl?: string | null;
  gender?: boolean | null;
  birth?: string | null;
}
interface MyDropResponse {
  // /users/my-drop reuses the geo-search serializer, so it returns the full
  // MUSIC/VOTE/PLAYLIST union — not MUSIC only.
  droppings: DropSearchItem[];
}
interface MyLikeResponse {
  droppings: { droppingId: string; likedAt: string }[];
}
interface CommentItem {
  id: number;
  content: string;
  droppingId: string;
  username: string;
}
interface PlaylistListItem {
  id: string;
  name: string;
  albumImageUrl?: string | null;
}
interface PlaylistMyResponse {
  playlists: PlaylistListItem[];
}
interface PlaylistDetailResponse {
  id: string;
  name: string;
  songs: { id: string; title: string; artist: string; duration?: number; albumImagePath: string }[];
}
interface NotificationItem {
  id: string;
  type: NotificationType;
  droppingId: string;
  actorId: number;
  actorUsername: string | null;
  songId: string | null;
  commentContent: string | null;
  isRead: boolean;
  createdAt: string;
}
interface NotificationListResponse {
  notifications: NotificationItem[];
  nextCursor: string | null;
}

// ── helpers ─────────────────────────────────────────────────────────────────

function haversineMeters(a: Coords, b: Coords): number {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** "부산광역시 사상구 괘법동" → "사상구 괘법동" (last two parts). */
function shortLabel(address: string | null): string {
  if (!address) return '';
  const parts = address.trim().split(/\s+/);
  return parts.slice(-2).join(' ');
}

function dateLabelFull(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}
function dateLabelShort(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

// ── songs ───────────────────────────────────────────────────────────────────

function searchItemToSong(s: SongSearchItem): Song {
  return { id: s.id, provider: 'spotify', title: s.title, artist: s.artist, artworkUrl: s.albumImagePath };
}

export async function searchSongs(query: string): Promise<Song[]> {
  const q = query.trim();
  if (!q) return [];
  const res = await apiGet<SongSearchResponse>('/songs/search', { query: q }, false);
  return res.songSearchResponses.map(searchItemToSong);
}

/** Full song meta (only works once the song is persisted via a drop). */
export async function getSong(id: string): Promise<Song | undefined> {
  try {
    const s = await apiGet<SongResponse>(`/songs/${id}`, undefined, false);
    return { id: s.id, provider: 'spotify', title: s.title, artist: s.artist, durationMs: (s.duration ?? 0) * 1000, artworkUrl: s.albumImagePath };
  } catch {
    return undefined;
  }
}

// ── drops ───────────────────────────────────────────────────────────────────

export function searchItemToDrop(item: DropSearchItem, userCoords: Coords): Drop {
  const meters = haversineMeters(userCoords, { lat: item.latitude, lng: item.longitude });
  const base: Drop = {
    id: item.droppingId,
    authorId: String(item.userId),
    authorName: '',
    songId: '',
    note: item.content ?? '',
    lat: item.latitude,
    lng: item.longitude,
    address: item.address ?? '',
    locationLabel: shortLabel(item.address),
    likeCount: 0,
    liked: false,
    commentCount: 0,
    createdAt: '',
    dateLabel: '',
    distanceLabel: formatDistance(meters),
    mapX: 50,
    mapY: 50,
    active: meters < 600,
    dropType: item.type,
  };
  if (item.type === 'MUSIC') {
    return { ...base, songId: item.songId, title: item.title, artist: item.artist, albumImageUrl: item.albumImageUrl };
  }
  if (item.type === 'VOTE') {
    return { ...base, albumImageUrl: item.firstAlbumImageUrl, voteTopic: item.topic, voteOptionSongIds: item.options };
  }
  return { ...base, albumImageUrl: item.firstAlbumImageUrl, playlistName: item.playlistName, playlistSongIds: item.songIds };
}

/** Distance is in km on the backend. radiusMeters → km. */
export async function getNearbyDrops(userCoords: Coords, radiusMeters = 3000): Promise<Drop[]> {
  const res = await apiGet<DropSearchListResponse>('/droppings', {
    latitude: userCoords.lat,
    longitude: userCoords.lng,
    distance: Math.max(0.1, radiusMeters / 1000),
  });
  return res.droppings.map((d) => searchItemToDrop(d, userCoords));
}

export async function getMyDrops(userCoords: Coords): Promise<Drop[]> {
  const res = await apiGet<MyDropResponse>('/users/my-drop');
  return res.droppings.map((d) => searchItemToDrop(d, userCoords));
}

export async function getMusicDropDetail(id: string): Promise<MusicDropDetail> {
  return apiGet<MusicDropDetail>(`/droppings/${id}`);
}
export async function getVoteDropDetail(id: string): Promise<VoteDropDetail> {
  return apiGet<VoteDropDetail>(`/droppings/${id}`);
}
export async function getPlaylistDropDetail(id: string): Promise<PlaylistDropDetail> {
  return apiGet<PlaylistDropDetail>(`/droppings/${id}`);
}

export interface CreateMusicDropInput {
  songId: string;
  content: string;
  latitude: number;
  longitude: number;
  address: string;
}
export async function createMusicDrop(input: CreateMusicDropInput): Promise<void> {
  await apiPost('/droppings', { type: 'MUSIC', ...input });
}

export interface CreateVoteDropInput {
  topic: string;
  options: string[]; // songIds (2+)
  content: string;
  latitude: number;
  longitude: number;
  address: string;
}
export async function createVoteDrop(input: CreateVoteDropInput): Promise<void> {
  await apiPost('/droppings', { type: 'VOTE', ...input });
}

export interface CreatePlaylistDropInput {
  playlistName: string;
  songIds: string[];
  content: string;
  latitude: number;
  longitude: number;
  address: string;
}
export async function createPlaylistDrop(input: CreatePlaylistDropInput): Promise<void> {
  await apiPost('/droppings', { type: 'PLAYLIST', ...input });
}

export async function deleteDrop(id: string): Promise<void> {
  await apiDelete(`/droppings/${id}`);
}
export async function castVote(droppingId: string, songId: string): Promise<void> {
  await apiPost(`/droppings/${droppingId}/vote`, { songId });
}
export async function retractVote(droppingId: string): Promise<void> {
  await apiDelete(`/droppings/${droppingId}/vote`);
}

// ── likes ───────────────────────────────────────────────────────────────────

/** Toggles; returns the resulting liked state. */
export async function toggleLike(droppingId: string): Promise<boolean> {
  const res = await apiPost<{ liked: boolean }>('/likes', { droppingId });
  return res.liked;
}
export async function getDropLikeCount(droppingId: string): Promise<number> {
  const res = await apiGet<{ likeCount: number }>(`/likes/count/dropping/${droppingId}`, undefined, false);
  return res.likeCount;
}
export async function getMyLikeCount(): Promise<number> {
  const res = await apiGet<{ likeCount: number }>('/likes/count/user');
  return res.likeCount;
}
/** droppingIds the current user has liked (for heart state). */
export async function getMyLikedDropIds(): Promise<string[]> {
  const res = await apiGet<MyLikeResponse>('/users/my-like');
  return res.droppings.map((d) => d.droppingId);
}

// ── comments ────────────────────────────────────────────────────────────────

function commentItemToComment(c: CommentItem): Comment {
  return { id: String(c.id), dropId: c.droppingId, authorName: c.username, text: c.content, dateLabel: '' };
}
export async function getComments(droppingId: string): Promise<Comment[]> {
  const res = await apiGet<CommentItem[]>(`/comments/droppings/${droppingId}`, undefined, false);
  return res.map(commentItemToComment);
}
export async function getCommentCount(droppingId: string): Promise<number> {
  const res = await apiGet<{ count: number }>(`/comments/count/${droppingId}`, undefined, false);
  return res.count;
}
export async function createComment(droppingId: string, content: string): Promise<void> {
  await apiPost('/comments', { content, droppingId });
}
export async function updateComment(commentId: string, content: string): Promise<void> {
  await apiPut(`/comments/${commentId}`, { content });
}
export async function deleteComment(commentId: string): Promise<void> {
  await apiDelete(`/comments/${commentId}`);
}

// ── playlists ───────────────────────────────────────────────────────────────

function detailToPlaylist(d: PlaylistDetailResponse, ownerName: string): Playlist {
  return {
    id: d.id,
    ownerName,
    name: d.name,
    songCount: d.songs.length,
    totalDurationLabel: '',
    coverSongId: d.songs[0]?.id,
    songIds: d.songs.map((s) => s.id),
  };
}
export async function getMyPlaylists(): Promise<PlaylistListItem[]> {
  const res = await apiGet<PlaylistMyResponse>('/playlists/my');
  return res.playlists;
}
export async function getPlaylistDetail(id: string): Promise<PlaylistDetailResponse> {
  return apiGet<PlaylistDetailResponse>(`/playlists/${id}`, undefined, false);
}
/** Full playlist with songs cached as Song[]. */
export async function getPlaylistWithSongs(
  id: string,
  ownerName: string,
): Promise<{ playlist: Playlist; songs: Song[] }> {
  const d = await getPlaylistDetail(id);
  const songs: Song[] = d.songs.map((s) => ({
    id: s.id,
    provider: 'spotify',
    title: s.title,
    artist: s.artist,
    durationMs: (s.duration ?? 0) * 1000,
    artworkUrl: s.albumImagePath,
  }));
  return { playlist: detailToPlaylist(d, ownerName), songs };
}
export async function createPlaylist(name: string): Promise<void> {
  await apiPost('/playlists', { name });
}
export async function renamePlaylist(id: string, name: string): Promise<void> {
  await apiPut(`/playlists/${id}`, { name });
}
export async function deletePlaylist(id: string): Promise<void> {
  await apiDelete(`/playlists/${id}`);
}
/** Songs must already be persisted (else 404 SongNotFound). */
export async function addSongsToPlaylist(id: string, songIds: string[]): Promise<void> {
  await apiPost(`/playlists/${id}/songs`, { songIds });
}
export async function removeSongFromPlaylist(id: string, songId: string): Promise<void> {
  await apiDelete(`/playlists/${id}/songs/${songId}`);
}

// ── profile ─────────────────────────────────────────────────────────────────

export interface Profile {
  username: string;
  profileImageUrl?: string | null;
  gender?: boolean | null;
  birthDate?: string | null; // YYYY-MM-DD
}
export async function getProfile(): Promise<Profile> {
  const p = await apiGet<ProfileResponse>('/users');
  return {
    username: p.username,
    profileImageUrl: p.profileImageUrl,
    gender: p.gender,
    birthDate: p.birth ? p.birth.slice(0, 10) : null,
  };
}
export interface UpdateProfileInput {
  username?: string;
  gender?: boolean;
  birthDate?: string; // YYYY-MM-DD
}
export async function updateProfile(input: UpdateProfileInput): Promise<void> {
  await apiPatch('/users', input);
}
export async function withdrawAccount(): Promise<void> {
  await apiPost('/users/withdrawal');
}

// ── notifications ───────────────────────────────────────────────────────────

function notiItemToNoti(n: NotificationItem): AppNotification {
  return {
    id: n.id,
    type: n.type,
    droppingId: n.droppingId,
    actorName: n.actorUsername ?? '',
    songId: n.songId ?? undefined,
    commentContent: n.commentContent ?? undefined,
    isRead: n.isRead,
    createdAt: n.createdAt,
    dateLabel: dateLabelShort(n.createdAt),
  };
}
export async function getNotifications(): Promise<AppNotification[]> {
  const res = await apiGet<NotificationListResponse>('/notifications');
  return res.notifications.map(notiItemToNoti);
}
export async function getUnreadCount(): Promise<number> {
  const res = await apiGet<{ unreadCount: number }>('/notifications/unread-count');
  return res.unreadCount;
}
export async function markNotificationRead(id: string): Promise<void> {
  await apiPatch(`/notifications/${id}/read`);
}
export async function markAllNotificationsRead(): Promise<void> {
  await apiPatch('/notifications/read-all');
}

export { dateLabelFull, dateLabelShort, shortLabel, haversineMeters };
