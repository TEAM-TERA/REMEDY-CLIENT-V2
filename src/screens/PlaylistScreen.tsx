/**
 * Playlist — README §4.7. Cover hero, 전체 재생 / 셔플, track list.
 * Playlists are managed in the store (mock): rename / delete the playlist
 * (header ⋮), add songs (+ 곡 추가), remove a song (row ⋮).
 */
import React, { useCallback, useState } from 'react';
import { Alert, Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SongCover } from '@/components/SongCover';
import { PromptModal } from '@/components/PromptModal';
import { RainbowGradient } from '@/components/Gradient';
import { ChevronLeft, DotsVertical, Play, Repeat } from '@/components/Icons';
import { colors, font, gradients } from '@/theme/tokens';
import { useAppStore } from '@/store/useAppStore';
import type { RootStackParamList } from '@/navigation/types';

const W = Dimensions.get('window').width;
const HERO = 290;

function durationLabel(totalMs: number): string {
  const mins = Math.round(totalMs / 60000);
  if (mins <= 0) return '0분';
  return mins >= 60 ? `${Math.floor(mins / 60)}시간 ${mins % 60}분` : `${mins}분`;
}

export default function PlaylistScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const playlistId = useAppStore((s) => s.playlistId);
  const playlists = useAppStore((s) => s.playlists);
  const playQueue = useAppStore((s) => s.playQueue);
  const lookupSong = useAppStore((s) => s.lookupSong);
  const removeSongFromPlaylist = useAppStore((s) => s.removeSongFromPlaylist);
  const deletePlaylist = useAppStore((s) => s.deletePlaylist);
  const renamePlaylist = useAppStore((s) => s.renamePlaylist);
  const refreshPlaylist = useAppStore((s) => s.refreshPlaylist);

  // pull fresh songs from the backend when this playlist opens
  useFocusEffect(
    useCallback(() => {
      if (playlistId) refreshPlaylist(playlistId);
    }, [playlistId, refreshPlaylist]),
  );

  const [renaming, setRenaming] = useState(false);

  const pl = playlists.find((p) => p.id === playlistId);
  if (!pl) return <View style={styles.root} />;

  const songs = pl.songIds.map((id) => ({ id, song: lookupSong(id) }));
  const totalMs = songs.reduce((sum, x) => sum + (x.song.durationMs ?? 0), 0);
  const cover = pl.songIds[0];

  // play the whole playlist as a queue starting at `index` (enables next/prev)
  const playAt = (index: number) => {
    playQueue(pl.songIds.map((id) => ({ songId: id })), index);
    navigation.navigate('Player');
  };

  const onMenu = () => {
    Alert.alert(pl.name, undefined, [
      { text: '이름 변경', onPress: () => setRenaming(true) },
      {
        text: '플레이리스트 삭제',
        style: 'destructive',
        onPress: async () => {
          const ok = await deletePlaylist(pl.id);
          if (ok) navigation.goBack();
        },
      },
      { text: '취소', style: 'cancel' },
    ]);
  };

  const onSongMenu = (songId: string, title: string) => {
    Alert.alert(title, '이 곡을 플레이리스트에서 뺄까요?', [
      { text: '빼기', style: 'destructive', onPress: () => removeSongFromPlaylist(pl.id, songId) },
      { text: '취소', style: 'cancel' },
    ]);
  };

  return (
    <>
    <ScrollView style={styles.root} showsVerticalScrollIndicator={false}>
      {/* hero */}
      <View style={styles.hero}>
        <SongCover songId={cover} artworkUrl={cover ? lookupSong(cover).artworkUrl : undefined} size={W} height={HERO} radius={0} innerBorder={false} style={styles.heroCover} />
        <LinearGradient
          colors={['rgba(10,10,12,0.3)', 'transparent', 'rgba(10,10,12,0.9)', colors.bgBase]}
          locations={[0, 0.3, 0.8, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="뒤로" style={[styles.headerBtn, { top: insets.top + 15, left: 18 }]}>
          <ChevronLeft size={20} color="#fff" strokeWidth={2.2} />
        </Pressable>
        <Pressable onPress={onMenu} accessibilityRole="button" accessibilityLabel="플레이리스트 관리" style={[styles.headerBtn, { top: insets.top + 15, right: 18 }]}>
          <DotsVertical size={20} color="#fff" />
        </Pressable>
        <View style={styles.heroText}>
          <Text style={styles.name}>{pl.name}</Text>
          <Text style={styles.meta}>{pl.ownerName} · {pl.songIds.length}곡 · {durationLabel(totalMs)}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.actions}>
          <Pressable onPress={() => songs.length > 0 && playAt(0)} disabled={songs.length === 0} style={{ opacity: songs.length === 0 ? 0.5 : 1 }}>
            <RainbowGradient
              style={styles.playAll}
              locations={gradients.playlistPlayLocations as unknown as [number, number, number]}
            >
              <Play size={18} color="#2a1530" />
              <Text style={styles.playAllText}>전체 재생</Text>
            </RainbowGradient>
          </Pressable>
          <Repeat size={22} color="rgba(255,255,255,0.6)" strokeWidth={2} />
          <View style={{ flex: 1 }} />
          <Pressable onPress={() => navigation.navigate('AddSongs', { playlistId: pl.id })} style={styles.addBtn}>
            <Text style={styles.addBtnText}>+ 곡 추가</Text>
          </Pressable>
        </View>

        {songs.length === 0 ? (
          <Text style={styles.empty}>아직 곡이 없어요.{'\n'}"+ 곡 추가"로 담아보세요.</Text>
        ) : (
          <View style={{ marginTop: 22 }}>
            {songs.map((x, i) => (
              <Pressable key={`${x.id}-${i}`} onPress={() => playAt(i)} style={styles.songRow}>
                <Text style={styles.idx}>{i + 1}</Text>
                <SongCover songId={x.id} artworkUrl={x.song.artworkUrl} size={46} radius={8} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.songTitle} numberOfLines={1}>{x.song.title}</Text>
                  <Text style={styles.songArtist} numberOfLines={1}>{x.song.artist}</Text>
                </View>
                <Text style={styles.dur}>{x.song.durationLabel ?? ''}</Text>
                <Pressable onPress={() => onSongMenu(x.id, x.song.title)} hitSlop={10} accessibilityRole="button" accessibilityLabel="곡 메뉴">
                  <DotsVertical size={18} />
                </Pressable>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
    <PromptModal
      visible={renaming}
      title="이름 변경"
      initialValue={pl.name}
      confirmLabel="변경"
      onCancel={() => setRenaming(false)}
      onSubmit={(name) => {
        setRenaming(false);
        renamePlaylist(pl.id, name);
      }}
    />
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgBase },
  hero: { height: HERO, overflow: 'hidden' },
  heroCover: { position: 'absolute', top: 0, left: 0 },
  headerBtn: { position: 'absolute', width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
  heroText: { position: 'absolute', left: 24, right: 24, bottom: 20 },
  name: { fontFamily: font.serifBold, fontSize: 30, color: '#fff' },
  meta: { fontFamily: font.regular, fontSize: 13.5, color: 'rgba(255,255,255,0.6)', marginTop: 6 },

  body: { paddingHorizontal: 24, paddingTop: 18, paddingBottom: 40 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  playAll: { flexDirection: 'row', alignItems: 'center', gap: 9, height: 50, paddingHorizontal: 26, borderRadius: 25, boxShadow: '0 8px 22px -6px rgba(255,158,196,0.5)' },
  playAllText: { fontFamily: font.extrabold, fontSize: 15, color: '#2a1530' },
  addBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  addBtnText: { fontFamily: font.bold, fontSize: 13.5, color: 'rgba(255,255,255,0.85)' },
  empty: { fontFamily: font.regular, fontSize: 14, lineHeight: 22, color: 'rgba(255,255,255,0.45)', textAlign: 'center', marginTop: 40 },

  songRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 9 },
  idx: { width: 18, textAlign: 'center', fontFamily: font.regular, fontSize: 14, color: 'rgba(255,255,255,0.4)' },
  songTitle: { fontFamily: font.semibold, fontSize: 15, color: '#fff' },
  songArtist: { fontFamily: font.regular, fontSize: 12.5, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  dur: { fontFamily: font.regular, fontSize: 13, color: 'rgba(255,255,255,0.4)' },
});
