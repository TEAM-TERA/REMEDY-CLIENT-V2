/**
 * App state (Zustand) backed by REMEDY-BACK-V3.
 *  - Playback / map / drop-flow UI state is local (no backend playback API).
 *  - Domain data (drops, playlists, comments, likes) is loaded from and mutated
 *    through services/backend. Create endpoints return void, so mutations
 *    re-fetch to stay consistent (see backend-api-contract).
 */
import { create } from 'zustand';
import type { Comment, Drop, DropType, Playlist, ServiceId, Song } from '@/types';
import {
  DEFAULT_COORDS,
  getCurrentCoords,
  reverseGeocodeInfo,
  type Coords,
} from '@/services/location';
import * as be from '@/services/backend';
import { ApiError } from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';

export type QueueItem = { songId: string; dropId?: string };

/** Resolved entry for the 좋아요 tab. */
export interface LikedEntry {
  dropId: string;
  song: Song;
}

interface AppState {
  // playback (local)
  playing: boolean;
  progress: number;
  currentSongId: string;
  queue: QueueItem[];
  queueIndex: number;

  // domain data (backend)
  drops: Drop[];
  playlists: Playlist[];
  comments: Record<string, Comment[]>;
  likedDropIds: string[];
  likedDrops: LikedEntry[];

  // loading flags
  dropsLoading: boolean;
  busy: boolean;

  // location
  userCoords: Coords;
  userLocationLabel: string;
  userAddress: string;

  // selection
  selectedDropId: string;

  // map / profile / settings (local)
  mapVariant: 0 | 1;
  profileTab: 'playlists' | 'drops' | 'likes';
  services: Record<ServiceId, boolean>;
  defaultService: ServiceId;

  // drop flow
  dropType: DropType;
  dropSongId: string;
  dropQuery: string;
  note: string;
  voteTopic: string;
  voteOptionIds: string[]; // songIds chosen as vote options
  playlistPickIds: string[]; // songIds chosen for a PLAYLIST drop
  playlistDropName: string; // name for a PLAYLIST drop (distinct from the note)

  // song cache (search results / detail)
  songCache: Record<string, Song>;

  // current playlist screen target
  playlistId: string;

  // toast
  toast: boolean;
  toastMsg: string;

  // ── playback actions ──
  togglePlay: () => void;
  setPlaying: (v: boolean) => void;
  setProgress: (v: number) => void;
  selectPin: (id: string) => void;
  openDrop: (id: string) => void;
  openSong: (songId: string) => void;
  playQueue: (items: QueueItem[], index: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;

  // ── lookups ──
  lookupDrop: (id: string) => Drop | undefined;
  lookupSong: (id: string) => Song;
  lookupPlaylist: (id: string) => Playlist | undefined;
  commentsFor: (dropId: string) => Comment[];
  cacheSongs: (songs: Song[]) => void;
  /** add any drops not already present (so Profile's my-drops can open in player) */
  mergeDrops: (drops: Drop[]) => void;

  // ── loaders ──
  refreshLocation: () => Promise<void>;
  loadNearbyDrops: () => Promise<void>;
  loadMyDrops: () => Promise<Drop[]>;
  loadComments: (dropId: string) => Promise<void>;
  loadPlaylists: () => Promise<void>;
  loadLikes: () => Promise<void>;
  loadDropSocial: (dropId: string) => Promise<void>;

  // ── drop flow ──
  setDropType: (t: DropType) => void;
  setDropSong: (id: string) => void;
  setDropQuery: (q: string) => void;
  setNote: (n: string) => void;
  setVoteTopic: (t: string) => void;
  setPlaylistDropName: (n: string) => void;
  toggleVoteOption: (songId: string) => void;
  togglePlaylistPick: (songId: string) => void;
  resetDropFlow: () => void;
  confirmDrop: () => Promise<{ ok: boolean; message: string }>;

  // ── drop ops ──
  removeDrop: (id: string) => Promise<void>;
  toggleDropLike: (dropId: string) => Promise<void>;
  toggleSelectedDropLike: () => Promise<void>;
  unlikeDrop: (dropId: string) => Promise<void>;
  voteOnDrop: (dropId: string, songId: string) => Promise<void>;
  unvoteDrop: (dropId: string) => Promise<void>;

  // ── comments ──
  addComment: (dropId: string, text: string) => Promise<{ ok: boolean; message: string }>;
  editComment: (dropId: string, commentId: string, text: string) => Promise<{ ok: boolean; message: string }>;
  removeComment: (dropId: string, commentId: string) => Promise<void>;

  // ── playlists ──
  createPlaylist: (name: string) => Promise<string | null>;
  deletePlaylist: (id: string) => Promise<boolean>;
  renamePlaylist: (id: string, name: string) => Promise<void>;
  addSongToPlaylist: (plId: string, songId: string) => Promise<{ ok: boolean; message: string }>;
  removeSongFromPlaylist: (plId: string, songId: string) => Promise<void>;
  setPlaylist: (id: string) => void;
  refreshPlaylist: (id: string) => Promise<void>;

  // ── settings (local) ──
  setMapVariant: (v: 0 | 1) => void;
  setProfileTab: (t: AppState['profileTab']) => void;
  toggleService: (id: ServiceId) => void;
  setDefaultService: (id: ServiceId) => void;
  connectService: (id: ServiceId) => void;

  // ── toast ──
  showToast: (msg: string) => void;
  hideToast: () => void;
}

let toastTimer: ReturnType<typeof setTimeout> | undefined;

const UNKNOWN_SONG = (id: string): Song => ({ id, title: '알 수 없는 곡', artist: '' });

function meName(): string {
  return useAuthStore.getState().user?.username ?? '나';
}

export const useAppStore = create<AppState>((set, get) => ({
  playing: false,
  progress: 0,
  currentSongId: '',
  queue: [],
  queueIndex: 0,

  drops: [],
  playlists: [],
  comments: {},
  likedDropIds: [],
  likedDrops: [],

  dropsLoading: false,
  busy: false,

  userCoords: DEFAULT_COORDS,
  userLocationLabel: '사상구 괘법동',
  userAddress: '부산광역시 사상구 괘법동',

  selectedDropId: '',

  mapVariant: 0,
  profileTab: 'drops',
  services: { spotify: true, apple: false, youtube: true },
  defaultService: 'spotify',

  dropType: 'MUSIC',
  dropSongId: '',
  dropQuery: '',
  note: '',
  voteTopic: '',
  voteOptionIds: [],
  playlistPickIds: [],
  playlistDropName: '',

  songCache: {},
  playlistId: '',

  toast: false,
  toastMsg: '',

  // ── playback ──
  togglePlay: () => set((s) => ({ playing: !s.playing })),
  setPlaying: (v) => set({ playing: v }),
  setProgress: (v) => set({ progress: Math.max(0, Math.min(100, v)) }),
  selectPin: (id) => {
    const d = get().drops.find((x) => x.id === id);
    set({ selectedDropId: id, currentSongId: d?.songId || get().currentSongId });
  },
  openDrop: (id) => {
    const drops = get().drops;
    const idx = drops.findIndex((x) => x.id === id);
    if (idx < 0) return;
    const queue: QueueItem[] = drops.filter((x) => x.songId).map((x) => ({ songId: x.songId, dropId: x.id }));
    const qIdx = Math.max(0, queue.findIndex((q) => q.dropId === id));
    set({ queue, queueIndex: qIdx, selectedDropId: id, currentSongId: drops[idx].songId, playing: true, progress: 0 });
  },
  openSong: (songId) =>
    set({ queue: [{ songId }], queueIndex: 0, currentSongId: songId, selectedDropId: '', playing: true, progress: 0 }),
  playQueue: (items, index) => {
    if (items.length === 0) return;
    const i = Math.max(0, Math.min(index, items.length - 1));
    const item = items[i];
    set({ queue: items, queueIndex: i, currentSongId: item.songId, selectedDropId: item.dropId ?? '', playing: true, progress: 0 });
  },
  nextTrack: () => {
    const { queue, queueIndex } = get();
    if (queue.length === 0) return;
    const i = (queueIndex + 1) % queue.length;
    const item = queue[i];
    set({ queueIndex: i, currentSongId: item.songId, selectedDropId: item.dropId ?? '', playing: true, progress: 0 });
    if (item.dropId) get().loadDropSocial(item.dropId);
  },
  prevTrack: () => {
    const { queue, queueIndex } = get();
    if (queue.length === 0) return;
    const i = (queueIndex - 1 + queue.length) % queue.length;
    const item = queue[i];
    set({ queueIndex: i, currentSongId: item.songId, selectedDropId: item.dropId ?? '', playing: true, progress: 0 });
    if (item.dropId) get().loadDropSocial(item.dropId);
  },

  // ── lookups ──
  lookupDrop: (id) => get().drops.find((d) => d.id === id),
  lookupSong: (id) => get().songCache[id] ?? UNKNOWN_SONG(id),
  lookupPlaylist: (id) => get().playlists.find((p) => p.id === id),
  commentsFor: (dropId) => get().comments[dropId] ?? [],
  cacheSongs: (songs) =>
    set((s) => {
      const next = { ...s.songCache };
      for (const song of songs) next[song.id] = song;
      return { songCache: next };
    }),
  mergeDrops: (incoming) =>
    set((s) => {
      const ids = new Set(s.drops.map((d) => d.id));
      const add = incoming.filter((d) => !ids.has(d.id));
      return add.length ? { drops: [...s.drops, ...add] } : {};
    }),

  // ── loaders ──
  refreshLocation: async () => {
    const coords = await getCurrentCoords();
    const info = await reverseGeocodeInfo(coords);
    set({ userCoords: coords, userLocationLabel: info.label, userAddress: info.address });
  },

  loadNearbyDrops: async () => {
    set({ dropsLoading: true });
    try {
      const coords = get().userCoords;
      const drops = await be.getNearbyDrops(coords);
      // cache MUSIC song meta so the player/pins render without extra calls
      const songs: Song[] = drops
        .filter((d) => d.dropType === 'MUSIC' && d.songId)
        .map((d) => ({ id: d.songId, title: d.title ?? '', artist: d.artist ?? '', artworkUrl: d.albumImageUrl }));
      // merge known like state
      const likedSet = new Set(get().likedDropIds);
      const merged = drops.map((d) => ({ ...d, liked: likedSet.has(d.id) }));
      get().cacheSongs(songs);
      set({ drops: merged, dropsLoading: false });
    } catch {
      set({ dropsLoading: false });
      get().showToast('주변 드랍을 불러오지 못했어요');
    }
  },

  loadMyDrops: async () => {
    try {
      const drops = await be.getMyDrops(get().userCoords);
      const songs: Song[] = drops
        .filter((d) => d.dropType === 'MUSIC' && d.songId)
        .map((d) => ({ id: d.songId, title: d.title ?? '', artist: d.artist ?? '', artworkUrl: d.albumImageUrl }));
      get().cacheSongs(songs);
      return drops;
    } catch {
      return [];
    }
  },

  loadComments: async (dropId) => {
    try {
      const comments = await be.getComments(dropId);
      set((s) => ({ comments: { ...s.comments, [dropId]: comments } }));
    } catch {
      /* keep existing */
    }
  },

  loadDropSocial: async (dropId) => {
    try {
      const [likeCount, commentCount] = await Promise.all([
        be.getDropLikeCount(dropId),
        be.getCommentCount(dropId),
      ]);
      set((s) => ({
        drops: s.drops.map((d) => (d.id === dropId ? { ...d, likeCount, commentCount } : d)),
      }));
    } catch {
      /* ignore */
    }
    get().loadComments(dropId);
  },

  loadPlaylists: async () => {
    try {
      const owner = meName();
      const list = await be.getMyPlaylists();
      const enriched = await Promise.all(
        list.map(async (p) => {
          try {
            const { playlist, songs } = await be.getPlaylistWithSongs(p.id, owner);
            get().cacheSongs(songs);
            return {
              ...playlist,
              coverImageUrl: p.albumImageUrl ?? songs[0]?.artworkUrl,
            } as Playlist;
          } catch {
            return {
              id: p.id,
              ownerName: owner,
              name: p.name,
              songCount: 0,
              totalDurationLabel: '',
              songIds: [],
              coverImageUrl: p.albumImageUrl ?? undefined,
            } as Playlist;
          }
        }),
      );
      set({ playlists: enriched });
    } catch {
      /* keep existing */
    }
  },

  loadLikes: async () => {
    try {
      const ids = await be.getMyLikedDropIds();
      set({ likedDropIds: ids });
      const entries = await Promise.all(
        ids.map(async (dropId) => {
          try {
            // a liked drop may be MUSIC, VOTE or PLAYLIST — the detail shape differs
            const detail = (await be.getMusicDropDetail(dropId)) as unknown as {
              type?: string;
              songId?: string;
              albumImageUrl?: string;
              topic?: string;
              playlistName?: string;
              options?: { songId: string; title: string; artist: string; albumImagePath: string }[];
              songs?: { songId: string; title: string; artist: string; albumImagePath: string }[];
            };

            // MUSIC: top-level songId + albumImageUrl
            if (detail.songId) {
              const song = (await be.getSong(detail.songId)) ?? { id: detail.songId, title: '', artist: '', artworkUrl: detail.albumImageUrl };
              const resolved: Song = { ...song, artworkUrl: song.artworkUrl ?? detail.albumImageUrl };
              get().cacheSongs([resolved]);
              return { dropId, song: resolved } as LikedEntry;
            }
            // VOTE: first option track
            const first = detail.options?.[0] ?? detail.songs?.[0];
            if (first) {
              const label = detail.topic ?? detail.playlistName;
              const song: Song = {
                id: first.songId,
                title: label ? `${detail.topic ? '투표' : '플리'} · ${label}` : first.title,
                artist: first.artist,
                artworkUrl: first.albumImagePath,
              };
              return { dropId, song } as LikedEntry;
            }
            return null;
          } catch {
            return null;
          }
        }),
      );
      set({ likedDrops: entries.filter((e): e is LikedEntry => e !== null) });
    } catch {
      /* keep existing */
    }
  },

  // ── drop flow ──
  setDropType: (t) => set({ dropType: t }),
  setDropSong: (id) => set({ dropSongId: id }),
  setDropQuery: (q) => set({ dropQuery: q }),
  setNote: (n) => set({ note: n.slice(0, 200) }),
  setVoteTopic: (t) => set({ voteTopic: t.slice(0, 80) }),
  setPlaylistDropName: (n) => set({ playlistDropName: n.slice(0, 60) }),
  toggleVoteOption: (songId) =>
    set((s) => ({
      voteOptionIds: s.voteOptionIds.includes(songId)
        ? s.voteOptionIds.filter((id) => id !== songId)
        : [...s.voteOptionIds, songId],
    })),
  togglePlaylistPick: (songId) =>
    set((s) => ({
      playlistPickIds: s.playlistPickIds.includes(songId)
        ? s.playlistPickIds.filter((id) => id !== songId)
        : [...s.playlistPickIds, songId],
    })),
  resetDropFlow: () =>
    set({ dropType: 'MUSIC', dropSongId: '', dropQuery: '', note: '', voteTopic: '', voteOptionIds: [], playlistPickIds: [], playlistDropName: '' }),

  confirmDrop: async () => {
    const s = get();
    const { userCoords, userAddress } = s;
    const lat = userCoords.lat;
    const lng = userCoords.lng;
    set({ busy: true });
    try {
      if (s.dropType === 'MUSIC') {
        if (!s.dropSongId) return { ok: false, message: '드랍할 곡을 선택해주세요.' };
        await be.createMusicDrop({ songId: s.dropSongId, content: s.note, latitude: lat, longitude: lng, address: userAddress });
      } else if (s.dropType === 'VOTE') {
        if (!s.voteTopic.trim()) return { ok: false, message: '투표 주제를 입력해주세요.' };
        if (s.voteOptionIds.length < 2) return { ok: false, message: '곡을 2개 이상 선택해주세요.' };
        await be.createVoteDrop({ topic: s.voteTopic.trim(), options: s.voteOptionIds, content: s.note, latitude: lat, longitude: lng, address: userAddress });
      } else {
        if (s.playlistPickIds.length < 1) return { ok: false, message: '플레이리스트에 담을 곡을 선택해주세요.' };
        await be.createPlaylistDrop({ playlistName: s.playlistDropName.trim() || '내 플레이리스트', songIds: s.playlistPickIds, content: s.note, latitude: lat, longitude: lng, address: userAddress });
      }
      await get().loadNearbyDrops();
      get().showToast('이 자리에 음악을 드랍했어요');
      return { ok: true, message: '드랍 완료' };
    } catch (e) {
      if (e instanceof ApiError && e.code === 'DROPPING_ALREADY_EXISTS') {
        return { ok: false, message: '이미 근처에 드랍이 있어요. 조금 이동해서 다시 시도해보세요.' };
      }
      const msg = e instanceof ApiError ? e.message : '드랍에 실패했어요.';
      return { ok: false, message: msg };
    } finally {
      set({ busy: false });
    }
  },

  // ── drop ops ──
  removeDrop: async (id) => {
    try {
      await be.deleteDrop(id);
      set((s) => ({ drops: s.drops.filter((d) => d.id !== id) }));
    } catch {
      /* ignore */
    }
  },

  toggleDropLike: async (dropId) => {
    if (!dropId) return;
    const prev = get().drops.find((d) => d.id === dropId);
    const wasLiked = get().likedDropIds.includes(dropId);
    const prevCount = prev?.likeCount ?? 0;
    // optimistic
    set((s) => ({
      likedDropIds: wasLiked ? s.likedDropIds.filter((x) => x !== dropId) : [...s.likedDropIds, dropId],
      drops: s.drops.map((d) =>
        d.id === dropId ? { ...d, liked: !wasLiked, likeCount: Math.max(0, d.likeCount + (wasLiked ? -1 : 1)) } : d,
      ),
    }));
    try {
      const liked = await be.toggleLike(dropId);
      const count = await be.getDropLikeCount(dropId);
      set((s) => ({
        likedDropIds: liked
          ? Array.from(new Set([...s.likedDropIds, dropId]))
          : s.likedDropIds.filter((x) => x !== dropId),
        drops: s.drops.map((d) => (d.id === dropId ? { ...d, liked, likeCount: count } : d)),
      }));
    } catch {
      // full revert (likedDropIds + the drop's liked/likeCount) and notify
      set((s) => ({
        likedDropIds: wasLiked ? [...s.likedDropIds, dropId] : s.likedDropIds.filter((x) => x !== dropId),
        drops: s.drops.map((d) => (d.id === dropId ? { ...d, liked: wasLiked, likeCount: prevCount } : d)),
      }));
      get().showToast('좋아요를 처리하지 못했어요');
    }
  },
  toggleSelectedDropLike: async () => {
    const dropId = get().selectedDropId;
    if (dropId) await get().toggleDropLike(dropId);
  },

  unlikeDrop: async (dropId) => {
    try {
      await be.toggleLike(dropId); // toggling an already-liked drop unlikes it
      set((s) => ({
        likedDropIds: s.likedDropIds.filter((x) => x !== dropId),
        likedDrops: s.likedDrops.filter((e) => e.dropId !== dropId),
        drops: s.drops.map((d) => (d.id === dropId ? { ...d, liked: false, likeCount: Math.max(0, d.likeCount - 1) } : d)),
      }));
    } catch {
      /* ignore */
    }
  },

  voteOnDrop: async (dropId, songId) => {
    await be.castVote(dropId, songId);
  },
  unvoteDrop: async (dropId) => {
    await be.retractVote(dropId);
  },

  // ── comments ──
  addComment: async (dropId, text) => {
    const t = text.trim();
    if (!t) return { ok: false, message: '내용을 입력해주세요.' };
    try {
      await be.createComment(dropId, t);
      await get().loadComments(dropId);
      const count = await be.getCommentCount(dropId);
      set((s) => ({ drops: s.drops.map((d) => (d.id === dropId ? { ...d, commentCount: count } : d)) }));
      return { ok: true, message: '댓글을 남겼어요' };
    } catch (e) {
      return { ok: false, message: e instanceof ApiError ? e.message : '댓글을 남기지 못했어요.' };
    }
  },
  editComment: async (dropId, commentId, text) => {
    const t = text.trim();
    if (!t) return { ok: false, message: '내용을 입력해주세요.' };
    try {
      await be.updateComment(commentId, t);
      await get().loadComments(dropId);
      return { ok: true, message: '댓글을 수정했어요' };
    } catch (e) {
      return { ok: false, message: e instanceof ApiError ? e.message : '댓글을 수정하지 못했어요.' };
    }
  },
  removeComment: async (dropId, commentId) => {
    // optimistic remove
    set((s) => ({ comments: { ...s.comments, [dropId]: (s.comments[dropId] ?? []).filter((c) => c.id !== commentId) } }));
    try {
      await be.deleteComment(commentId);
      const count = await be.getCommentCount(dropId);
      set((s) => ({ drops: s.drops.map((d) => (d.id === dropId ? { ...d, commentCount: count } : d)) }));
    } catch {
      // re-sync on failure
      get().loadComments(dropId);
    }
  },

  // ── playlists ──
  createPlaylist: async (name) => {
    const trimmed = name.trim();
    if (!trimmed) return null;
    try {
      await be.createPlaylist(trimmed);
      await get().loadPlaylists();
      // newest playlist with this name
      const matches = get().playlists.filter((p) => p.name === trimmed);
      return matches.length ? matches[matches.length - 1].id : null;
    } catch {
      return null;
    }
  },
  deletePlaylist: async (id) => {
    try {
      await be.deletePlaylist(id);
      set((s) => ({ playlists: s.playlists.filter((p) => p.id !== id) }));
      return true;
    } catch {
      get().showToast('플레이리스트를 삭제하지 못했어요');
      return false;
    }
  },
  renamePlaylist: async (id, name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const prev = get().playlists.find((p) => p.id === id)?.name;
    set((s) => ({ playlists: s.playlists.map((p) => (p.id === id ? { ...p, name: trimmed } : p)) }));
    try {
      await be.renamePlaylist(id, trimmed);
    } catch {
      // revert optimistic rename
      if (prev !== undefined) set((s) => ({ playlists: s.playlists.map((p) => (p.id === id ? { ...p, name: prev } : p)) }));
      get().showToast('이름을 변경하지 못했어요');
    }
  },
  addSongToPlaylist: async (plId, songId) => {
    try {
      await be.addSongsToPlaylist(plId, [songId]);
      await get().refreshPlaylist(plId);
      return { ok: true, message: '추가했어요' };
    } catch (e) {
      if (e instanceof ApiError && (e.code === 'SONG_NOT_FOUND' || e.status === 404)) {
        return { ok: false, message: '아직 담을 수 없는 곡이에요. (누군가 드랍한 곡만 담을 수 있어요)' };
      }
      if (e instanceof ApiError && e.code === 'SONG_ALREADY_IN_PLAYLIST') {
        return { ok: false, message: '이미 담긴 곡이에요.' };
      }
      const msg = e instanceof ApiError ? e.message : '추가에 실패했어요.';
      return { ok: false, message: msg };
    }
  },
  removeSongFromPlaylist: async (plId, songId) => {
    // optimistic
    set((s) => ({
      playlists: s.playlists.map((p) =>
        p.id === plId
          ? { ...p, songIds: p.songIds.filter((x) => x !== songId), songCount: Math.max(0, p.songCount - 1) }
          : p,
      ),
    }));
    try {
      await be.removeSongFromPlaylist(plId, songId);
    } catch {
      // re-sync from server on failure
      get().refreshPlaylist(plId);
      get().showToast('곡을 빼지 못했어요');
    }
  },
  setPlaylist: (id) => set({ playlistId: id }),
  refreshPlaylist: async (id) => {
    try {
      const owner = meName();
      const { playlist, songs } = await be.getPlaylistWithSongs(id, owner);
      get().cacheSongs(songs);
      set((s) => ({
        playlists: s.playlists.map((p) =>
          p.id === id ? { ...playlist, coverImageUrl: songs[0]?.artworkUrl ?? p.coverImageUrl } : p,
        ),
      }));
    } catch {
      /* ignore */
    }
  },

  // ── settings (local) ──
  setMapVariant: (v) => set({ mapVariant: v }),
  setProfileTab: (t) => set({ profileTab: t }),
  toggleService: (id) => set((s) => ({ services: { ...s.services, [id]: !s.services[id] } })),
  setDefaultService: (id) => {
    if (get().services[id]) set({ defaultService: id });
  },
  connectService: (id) => set((s) => ({ services: { ...s.services, [id]: true }, defaultService: id })),

  // ── toast ──
  showToast: (msg) => {
    set({ toast: true, toastMsg: msg });
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => set({ toast: false }), 2600);
  },
  hideToast: () => set({ toast: false }),
}));
