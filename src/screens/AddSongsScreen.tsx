/**
 * Add songs to a playlist (playlist management). Search Spotify (or the mock
 * catalog) and tap a result to toggle it in/out of the target playlist.
 */
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SongCover } from '@/components/SongCover';
import { Check, Close, Search } from '@/components/Icons';
import { colors, font } from '@/theme/tokens';
import { searchSongs } from '@/services/backend';
import { useAppStore } from '@/store/useAppStore';
import type { RootStackParamList } from '@/navigation/types';
import type { Song } from '@/types';

export default function AddSongsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'AddSongs'>>();
  const playlistId = route.params.playlistId;
  const insets = useSafeAreaInsets();

  const playlists = useAppStore((s) => s.playlists);
  const cacheSongs = useAppStore((s) => s.cacheSongs);
  const addSongToPlaylist = useAppStore((s) => s.addSongToPlaylist);
  const removeSongFromPlaylist = useAppStore((s) => s.removeSongFromPlaylist);

  const pl = playlists.find((p) => p.id === playlistId);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setLoading(false);
      return;
    }
    if (debounce.current) clearTimeout(debounce.current);
    setLoading(true);
    debounce.current = setTimeout(async () => {
      try {
        const found = await searchSongs(q);
        cacheSongs(found);
        setResults(found);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [query, cacheSongs]);

  const inPlaylist = (id: string) => pl?.songIds.includes(id) ?? false;

  const toggle = async (s: Song) => {
    cacheSongs([s]);
    if (inPlaylist(s.id)) {
      removeSongFromPlaylist(playlistId, s.id);
      return;
    }
    setPending(s.id);
    const res = await addSongToPlaylist(playlistId, s.id);
    setPending(null);
    if (!res.ok) Alert.alert('담지 못했어요', res.message);
  };

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 17 }]}>
        <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="닫기" style={styles.iconBtn}>
          <Close size={19} color="#fff" strokeWidth={2.2} />
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>{pl ? `${pl.name}에 추가` : '곡 추가'}</Text>
        <View style={{ width: 42 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.searchBox}>
          <Search size={18} color="rgba(255,255,255,0.45)" strokeWidth={2} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="곡·아티스트 검색"
            placeholderTextColor="rgba(255,255,255,0.4)"
            autoCorrect={false}
            style={styles.input}
          />
          {loading && <ActivityIndicator size="small" color="rgba(255,255,255,0.5)" />}
        </View>

        {!query.trim() ? (
          <Text style={styles.hint}>곡을 검색해서 플레이리스트에 추가하세요.</Text>
        ) : results.length === 0 && !loading ? (
          <Text style={styles.hint}>검색 결과가 없어요.</Text>
        ) : null}

        <View style={{ marginTop: 10, paddingBottom: 24, gap: 2 }}>
          {results.map((s) => {
            const added = inPlaylist(s.id);
            return (
              <Pressable key={s.id} onPress={() => toggle(s)} disabled={pending === s.id} style={styles.row}>
                <SongCover songId={s.id} artworkUrl={s.artworkUrl} size={44} radius={10} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle} numberOfLines={1}>{s.title}</Text>
                  <Text style={styles.rowArtist} numberOfLines={1}>{s.artist}</Text>
                </View>
                <View style={[styles.addPill, added && styles.addPillOn]}>
                  {pending === s.id ? (
                    <ActivityIndicator size="small" color="rgba(255,255,255,0.7)" />
                  ) : added ? (
                    <Check size={16} color="#2a1530" strokeWidth={2.6} />
                  ) : (
                    <Text style={styles.addPillText}>추가</Text>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable onPress={() => navigation.goBack()} style={styles.doneBtn}>
          <Text style={styles.doneText}>완료{pl ? ` · ${pl.songIds.length}곡` : ''}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgBase },
  header: { paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, textAlign: 'center', fontFamily: font.serifBold, fontSize: 18, color: '#fff' },
  scroll: { paddingHorizontal: 24, paddingTop: 22 },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 48, paddingHorizontal: 16, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  input: { flex: 1, color: '#fff', fontFamily: font.regular, fontSize: 14.5, padding: 0 },
  hint: { marginTop: 18, fontFamily: font.regular, fontSize: 13.5, color: 'rgba(255,255,255,0.4)', textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 9, paddingHorizontal: 10, borderRadius: 12 },
  rowTitle: { fontFamily: font.semibold, fontSize: 14.5, color: '#fff' },
  rowArtist: { fontFamily: font.regular, fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 1 },
  addPill: { minWidth: 50, height: 30, paddingHorizontal: 12, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  addPillOn: { backgroundColor: colors.pink, borderColor: colors.pink },
  addPillText: { fontFamily: font.bold, fontSize: 12.5, color: 'rgba(255,255,255,0.8)' },
  footer: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 34 },
  doneBtn: { height: 54, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  doneText: { fontFamily: font.bold, fontSize: 16, color: '#fff' },
});
