/**
 * Global UI state (Zustand) — mirrors the prototype `state` minus navigation,
 * which React Navigation owns. Also holds the in-memory mock data that the app
 * mutates (drops, playlists, per-drop likes) so there's no backend. See README §5.
 */
import { create } from 'zustand';
import type { Comment, Drop, Playlist, ServiceId, Song } from '@/types';
import { ME, getSong } from '@/data/mock';
import { DEFAULT_COORDS, getCurrentCoords, reverseGeocodeInfo, type Coords } from '@/services/location';

/** A playback-queue entry; dropId present when the song came from a map drop. */
export type QueueItem = { songId: string; dropId?: string };

interface AppState {
  // playback
  playing: boolean;
  progress: number; // 0..100
  currentSongId: string;
  queue: QueueItem[]; // playback queue for next/prev
  queueIndex: number;

  // drops shown on the map (seeded from mock; new drops are appended here)
  drops: Drop[];
  // playlists (seeded from mock; user-managed)
  playlists: Playlist[];
  // comments per drop id (seeded from mock; user can post)
  comments: Record<string, Comment[]>;
  // songs the user liked (Profile 좋아요 tab) — starts empty, grows via the heart
  likedSongIds: string[];

  // current device location (reverse-geocoded)
  userCoords: Coords;
  userLocationLabel: string; // "사상구 괘법동"
  userAddress: string; // "부산광역시 사상구 괘법동"

  // current player drop / map selection
  selectedDropId: string;

  // map
  mapVariant: 0 | 1;

  // profile
  profileTab: 'playlists' | 'drops' | 'likes';

  // services / settings
  services: Record<ServiceId, boolean>;
  defaultService: ServiceId;

  // drop flow
  dropSongId: string;
  dropQuery: string;
  note: string;

  // songs seen via Spotify search (so a chosen Spotify track survives into the
  // Drop screen even though it isn't in the mock catalog)
  songCache: Record<string, Song>;

  // playlist screen
  playlistId: string;

  // toast
  toast: boolean;

  // actions
  togglePlay: () => void;
  setPlaying: (v: boolean) => void;
  setProgress: (v: number) => void;
  toggleLike: () => void; // like the current song (+ selected drop's count)
  toggleLikedSong: (songId: string) => void; // toggle a specific song's like
  lookupDrop: (id: string) => Drop | undefined;
  selectPin: (id: string) => void;
  openDrop: (id: string) => void; // selects + sets current song + plays
  openSong: (songId: string) => void;
  playQueue: (items: QueueItem[], index: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setMapVariant: (v: 0 | 1) => void;
  setProfileTab: (t: AppState['profileTab']) => void;
  toggleService: (id: ServiceId) => void;
  setDefaultService: (id: ServiceId) => void;
  connectService: (id: ServiceId) => void;
  setDropSong: (id: string) => void;
  cacheSongs: (songs: Song[]) => void;
  lookupSong: (id: string) => Song;
  setDropQuery: (q: string) => void;
  setNote: (n: string) => void;
  setPlaylist: (id: string) => void;
  confirmDrop: () => void;
  hideToast: () => void;
  resetDropFlow: () => void;

  // location
  refreshLocation: () => Promise<void>;

  // comments
  commentsFor: (dropId: string) => Comment[];
  addComment: (dropId: string, text: string) => void;

  // playlist management (mock)
  lookupPlaylist: (id: string) => Playlist | undefined;
  createPlaylist: (name: string) => string;
  deletePlaylist: (id: string) => void;
  renamePlaylist: (id: string, name: string) => void;
  addSongToPlaylist: (plId: string, songId: string) => void;
  removeSongFromPlaylist: (plId: string, songId: string) => void;
}

let toastTimer: ReturnType<typeof setTimeout> | undefined;
let plSeq = 0;

export const useAppStore = create<AppState>((set, get) => ({
  playing: true,
  progress: 18,
  currentSongId: 's1',
  drops: [], // start with no drops on the map; user creates them
  playlists: [], // start with no playlists; user creates them
  comments: {},
  likedSongIds: [], // start with no liked songs
  queue: [],
  queueIndex: 0,
  userCoords: DEFAULT_COORDS,
  userLocationLabel: '사상구 괘법동',
  userAddress: '부산광역시 사상구 괘법동',
  selectedDropId: '',
  mapVariant: 0,
  profileTab: 'drops',
  services: { spotify: true, apple: false, youtube: true },
  defaultService: 'spotify',
  dropSongId: 's1',
  dropQuery: '',
  note: '',
  songCache: {},
  playlistId: 'pl1',
  toast: false,

  togglePlay: () => set((s) => ({ playing: !s.playing })),
  setPlaying: (v) => set({ playing: v }),
  setProgress: (v) => set({ progress: Math.max(0, Math.min(100, v)) }),
  toggleLike: () =>
    set((s) => {
      const wasLiked = s.likedSongIds.includes(s.currentSongId);
      const likedSongIds = wasLiked
        ? s.likedSongIds.filter((id) => id !== s.currentSongId)
        : [...s.likedSongIds, s.currentSongId];
      // keep the selected drop's social count in sync with my like
      const drops = s.drops.map((d) =>
        d.id === s.selectedDropId
          ? { ...d, liked: !wasLiked, likeCount: Math.max(0, d.likeCount + (wasLiked ? -1 : 1)) }
          : d,
      );
      return { likedSongIds, drops };
    }),
  toggleLikedSong: (songId) =>
    set((s) => ({
      likedSongIds: s.likedSongIds.includes(songId)
        ? s.likedSongIds.filter((id) => id !== songId)
        : [...s.likedSongIds, songId],
    })),
  lookupDrop: (id) => get().drops.find((d) => d.id === id) ?? get().drops[0],
  selectPin: (id) => {
    const d = get().drops.find((x) => x.id === id);
    set({ selectedDropId: id, currentSongId: d ? d.songId : get().currentSongId });
  },
  openDrop: (id) => {
    const drops = get().drops;
    const idx = drops.findIndex((x) => x.id === id);
    if (idx < 0) return;
    // queue = all current drops, so next/prev moves between nearby drops
    const queue: QueueItem[] = drops.map((x) => ({ songId: x.songId, dropId: x.id }));
    set({ queue, queueIndex: idx, selectedDropId: id, currentSongId: drops[idx].songId, playing: true });
  },
  openSong: (songId) =>
    set({ queue: [{ songId }], queueIndex: 0, currentSongId: songId, selectedDropId: '', playing: true }),
  playQueue: (items, index) => {
    if (items.length === 0) return;
    const i = Math.max(0, Math.min(index, items.length - 1));
    const item = items[i];
    set({ queue: items, queueIndex: i, currentSongId: item.songId, selectedDropId: item.dropId ?? '', playing: true });
  },
  nextTrack: () => {
    const { queue, queueIndex } = get();
    if (queue.length === 0) return;
    const i = (queueIndex + 1) % queue.length;
    const item = queue[i];
    set({ queueIndex: i, currentSongId: item.songId, selectedDropId: item.dropId ?? '', playing: true });
  },
  prevTrack: () => {
    const { queue, queueIndex } = get();
    if (queue.length === 0) return;
    const i = (queueIndex - 1 + queue.length) % queue.length;
    const item = queue[i];
    set({ queueIndex: i, currentSongId: item.songId, selectedDropId: item.dropId ?? '', playing: true });
  },
  setMapVariant: (v) => set({ mapVariant: v }),
  setProfileTab: (t) => set({ profileTab: t }),
  toggleService: (id) => set((s) => ({ services: { ...s.services, [id]: !s.services[id] } })),
  setDefaultService: (id) => {
    if (get().services[id]) set({ defaultService: id });
  },
  connectService: (id) =>
    set((s) => ({ services: { ...s.services, [id]: true }, defaultService: id })),
  setDropSong: (id) => set({ dropSongId: id }),
  cacheSongs: (songs) =>
    set((s) => {
      const next = { ...s.songCache };
      for (const song of songs) next[song.id] = song;
      return { songCache: next };
    }),
  lookupSong: (id) => get().songCache[id] ?? getSong(id),
  setDropQuery: (q) => set({ dropQuery: q }),
  setNote: (n) => set({ note: n.slice(0, 200) }),
  setPlaylist: (id) => set({ playlistId: id }),
  confirmDrop: () => {
    const s = get();
    const song = s.songCache[s.dropSongId] ?? getSong(s.dropSongId);
    const now = new Date();
    const dateLabel = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일`;
    // fan new drops out in a small ring around "me" (map center) so they don't
    // stack; positions are relative (mapX/mapY) — RealMap places them near the
    // user's live location.
    const n = s.drops.length;
    const angle = n * 1.35;
    const newDrop: Drop = {
      id: `d_${now.getTime()}`,
      authorId: 'me',
      authorName: ME.displayName,
      songId: song.id,
      note: s.note,
      lat: s.userCoords.lat,
      lng: s.userCoords.lng,
      address: s.userAddress,
      locationLabel: s.userLocationLabel,
      likeCount: 0,
      liked: false,
      commentCount: 0,
      createdAt: now.toISOString(),
      dateLabel,
      distanceLabel: '바로 여기',
      mapX: 50 + Math.cos(angle) * 9,
      mapY: 47 + Math.sin(angle) * 9,
      active: true,
    };
    set({
      drops: [newDrop, ...s.drops],
      songCache: { ...s.songCache, [song.id]: song },
      selectedDropId: newDrop.id,
      currentSongId: song.id,
      toast: true,
      note: '',
    });
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => set({ toast: false }), 2600);
  },
  hideToast: () => set({ toast: false }),
  resetDropFlow: () => set({ note: '', dropQuery: '' }),

  // ---- location ----
  refreshLocation: async () => {
    const coords = await getCurrentCoords();
    const info = await reverseGeocodeInfo(coords);
    set({ userCoords: coords, userLocationLabel: info.label, userAddress: info.address });
  },

  // ---- comments ----
  commentsFor: (dropId) => get().comments[dropId] ?? [],
  addComment: (dropId, text) => {
    const t = text.trim();
    if (!t) return;
    const now = new Date();
    const comment: Comment = {
      id: `c_${now.getTime()}`,
      dropId,
      authorName: ME.displayName,
      text: t,
      dateLabel: `${now.getMonth() + 1}월 ${now.getDate()}일`,
    };
    set((s) => ({
      comments: { ...s.comments, [dropId]: [...(s.comments[dropId] ?? []), comment] },
      drops: s.drops.map((d) => (d.id === dropId ? { ...d, commentCount: d.commentCount + 1 } : d)),
    }));
  },

  // ---- playlist management ----
  lookupPlaylist: (id) => get().playlists.find((p) => p.id === id),
  createPlaylist: (name) => {
    const id = `pl_${Date.now()}_${plSeq++}`;
    const playlist: Playlist = {
      id,
      ownerName: ME.displayName,
      name: name.trim() || '새 플레이리스트',
      songCount: 0,
      totalDurationLabel: '0분',
      songIds: [],
    };
    set((s) => ({ playlists: [...s.playlists, playlist] }));
    return id;
  },
  deletePlaylist: (id) =>
    set((s) => ({ playlists: s.playlists.filter((p) => p.id !== id) })),
  renamePlaylist: (id, name) =>
    set((s) => ({
      playlists: s.playlists.map((p) => (p.id === id ? { ...p, name: name.trim() || p.name } : p)),
    })),
  addSongToPlaylist: (plId, songId) =>
    set((s) => ({
      playlists: s.playlists.map((p) =>
        p.id === plId && !p.songIds.includes(songId)
          ? { ...p, songIds: [...p.songIds, songId], songCount: p.songIds.length + 1 }
          : p,
      ),
    })),
  removeSongFromPlaylist: (plId, songId) =>
    set((s) => ({
      playlists: s.playlists.map((p) =>
        p.id === plId
          ? { ...p, songIds: p.songIds.filter((x) => x !== songId), songCount: Math.max(0, p.songIds.length - 1) }
          : p,
      ),
    })),
}));
