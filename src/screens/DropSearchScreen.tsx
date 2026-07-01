/**
 * Drop step 1 — pick the track(s) to drop. Search hits the backend
 * `GET /songs/search` (real Spotify via the server, no client secret).
 *
 * Drop type selector:
 *  - 음악 (MUSIC): single select → one song.
 *  - 투표 (VOTE): multi-select 2+ songs (options), topic entered on next step.
 *  - 플리 (PLAYLIST): multi-select songs for a playlist drop.
 * The selection is held in the store; "다음" goes to the Drop step.
 */
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SongCover } from '@/components/SongCover';
import { SignatureGradient } from '@/components/Gradient';
import { ArrowRight, Check, Close, Search } from '@/components/Icons';
import { colors, font } from '@/theme/tokens';
import { searchSongs } from '@/services/backend';
import { useAppStore } from '@/store/useAppStore';
import type { RootStackParamList } from '@/navigation/types';
import type { DropType, Song } from '@/types';

const TYPES: { key: DropType; label: string }[] = [
  { key: 'MUSIC', label: '음악' },
  { key: 'VOTE', label: '투표' },
  { key: 'PLAYLIST', label: '플리' },
];

export default function DropSearchScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const dropType = useAppStore((s) => s.dropType);
  const setDropType = useAppStore((s) => s.setDropType);
  const dropQuery = useAppStore((s) => s.dropQuery);
  const dropSongId = useAppStore((s) => s.dropSongId);
  const voteOptionIds = useAppStore((s) => s.voteOptionIds);
  const playlistPickIds = useAppStore((s) => s.playlistPickIds);
  const setDropQuery = useAppStore((s) => s.setDropQuery);
  const setDropSong = useAppStore((s) => s.setDropSong);
  const toggleVoteOption = useAppStore((s) => s.toggleVoteOption);
  const togglePlaylistPick = useAppStore((s) => s.togglePlaylistPick);
  const cacheSongs = useAppStore((s) => s.cacheSongs);
  const resetDropFlow = useAppStore((s) => s.resetDropFlow);

  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const q = dropQuery.trim();
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
  }, [dropQuery, cacheSongs]);

  const exitToMap = () => {
    resetDropFlow();
    navigation.reset({ index: 0, routes: [{ name: 'Map' }] });
  };

  const isSelected = (id: string) =>
    dropType === 'MUSIC' ? dropSongId === id : dropType === 'VOTE' ? voteOptionIds.includes(id) : playlistPickIds.includes(id);

  const onSelect = (s: Song) => {
    cacheSongs([s]);
    if (dropType === 'MUSIC') setDropSong(s.id);
    else if (dropType === 'VOTE') toggleVoteOption(s.id);
    else togglePlaylistPick(s.id);
  };

  const selectedCount = dropType === 'MUSIC' ? (dropSongId ? 1 : 0) : dropType === 'VOTE' ? voteOptionIds.length : playlistPickIds.length;
  const canNext = dropType === 'MUSIC' ? !!dropSongId : dropType === 'VOTE' ? voteOptionIds.length >= 2 : playlistPickIds.length >= 1;

  const showEmpty = !!dropQuery.trim() && results.length === 0 && !loading;

  const hint =
    dropType === 'MUSIC'
      ? '드랍할 곡을 검색해보세요.'
      : dropType === 'VOTE'
        ? '투표에 올릴 곡을 2개 이상 골라보세요.'
        : '플레이리스트에 담을 곡을 골라보세요.';

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 17 }]}>
        <Pressable onPress={exitToMap} accessibilityRole="button" accessibilityLabel="닫기" style={styles.iconBtn}>
          <Close size={19} color="#fff" strokeWidth={2.2} />
        </Pressable>
        <Text style={styles.title}>드랍 만들기</Text>
        <View style={{ width: 42 }} />
      </View>

      {/* type selector */}
      <View style={styles.typeRow}>
        {TYPES.map((t) => {
          const active = dropType === t.key;
          return (
            <Pressable key={t.key} onPress={() => setDropType(t.key)} style={[styles.typeBtn, active && styles.typeBtnOn]}>
              <Text style={[styles.typeText, active && styles.typeTextOn]}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.searchBox}>
          <Search size={18} color="rgba(255,255,255,0.45)" strokeWidth={2} />
          <TextInput
            value={dropQuery}
            onChangeText={setDropQuery}
            placeholder="곡·아티스트 검색"
            placeholderTextColor="rgba(255,255,255,0.4)"
            autoCorrect={false}
            style={styles.input}
          />
          {loading && <ActivityIndicator size="small" color="rgba(255,255,255,0.5)" />}
        </View>

        {!dropQuery.trim() ? (
          <Text style={styles.hint}>{hint}</Text>
        ) : showEmpty ? (
          <Text style={styles.hint}>검색 결과가 없어요.</Text>
        ) : null}

        <View style={{ marginTop: 10, paddingBottom: 14, gap: 2 }}>
          {results.map((s) => {
            const selected = isSelected(s.id);
            return (
              <Pressable key={s.id} onPress={() => onSelect(s)} style={[styles.row, selected && styles.rowSelected]}>
                <SongCover songId={s.id} artworkUrl={s.artworkUrl} size={44} radius={10} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle} numberOfLines={1}>{s.title}</Text>
                  <Text style={styles.rowArtist} numberOfLines={1}>{s.artist}</Text>
                </View>
                {selected && <Check size={18} color={colors.pink} strokeWidth={2.5} />}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable onPress={() => canNext && navigation.navigate('Drop')} disabled={!canNext} style={{ opacity: canNext ? 1 : 0.5 }}>
          <SignatureGradient style={styles.cta}>
            <Text style={styles.ctaText}>다음{selectedCount > 0 && dropType !== 'MUSIC' ? ` · ${selectedCount}곡` : ''}</Text>
            <ArrowRight size={18} color="#2a1530" strokeWidth={2.6} />
          </SignatureGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgBase },
  header: { paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: font.serifBold, fontSize: 18, color: '#fff' },
  typeRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 24, paddingTop: 18 },
  typeBtn: { flex: 1, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  typeBtnOn: { backgroundColor: 'rgba(255,143,182,0.14)', borderColor: 'rgba(255,143,182,0.5)' },
  typeText: { fontFamily: font.bold, fontSize: 14, color: 'rgba(255,255,255,0.55)' },
  typeTextOn: { color: colors.pink },
  scroll: { paddingHorizontal: 24, paddingTop: 18 },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 48, paddingHorizontal: 16, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  input: { flex: 1, color: '#fff', fontFamily: font.regular, fontSize: 14.5, padding: 0 },
  hint: { marginTop: 18, fontFamily: font.regular, fontSize: 13.5, color: 'rgba(255,255,255,0.4)', textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 9, paddingHorizontal: 10, borderRadius: 12, borderWidth: 1, borderColor: 'transparent' },
  rowSelected: { backgroundColor: 'rgba(255,143,182,0.12)', borderColor: 'rgba(255,143,182,0.4)' },
  rowTitle: { fontFamily: font.semibold, fontSize: 14.5, color: '#fff' },
  rowArtist: { fontFamily: font.regular, fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 1 },
  footer: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 34 },
  cta: { height: 58, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 12px 28px -8px rgba(255,143,182,0.65)' },
  ctaText: { fontFamily: font.extrabold, fontSize: 16, color: '#2a1530' },
});
