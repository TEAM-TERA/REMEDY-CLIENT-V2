/**
 * Drop step 1 — README §4.4. Search + select the track to drop.
 * Search hits the Spotify Search API via an app token (Client Credentials), so
 * it works with NO user login. Empty query shows the mock catalog as default
 * suggestions; if Spotify isn't configured it falls back to filtering mock.
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
import { SONGS } from '@/data/mock';
import { searchTracks } from '@/services/spotify';
import { spotifySearchConfigured } from '@/services/config';
import { useAppStore } from '@/store/useAppStore';
import type { RootStackParamList } from '@/navigation/types';
import type { Song } from '@/types';

const MOCK_SONGS = Object.values(SONGS);

export default function DropSearchScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const dropQuery = useAppStore((s) => s.dropQuery);
  const dropSongId = useAppStore((s) => s.dropSongId);
  const setDropQuery = useAppStore((s) => s.setDropQuery);
  const setDropSong = useAppStore((s) => s.setDropSong);
  const cacheSongs = useAppStore((s) => s.cacheSongs);
  const resetDropFlow = useAppStore((s) => s.resetDropFlow);

  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const q = dropQuery.trim();

    // empty query → no list (just the search hint)
    if (!q) {
      setResults([]);
      setLoading(false);
      return;
    }

    // no Spotify creds → filter the mock catalog
    if (!spotifySearchConfigured) {
      const lower = q.toLowerCase();
      setResults(
        MOCK_SONGS.filter((s) => s.title.toLowerCase().includes(lower) || s.artist.toLowerCase().includes(lower)),
      );
      return;
    }

    // Spotify search, debounced
    if (debounce.current) clearTimeout(debounce.current);
    setLoading(true);
    debounce.current = setTimeout(async () => {
      const found = await searchTracks(q);
      cacheSongs(found);
      setResults(found);
      setLoading(false);
    }, 350);

    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [dropQuery, cacheSongs]);

  const exitToMap = () => {
    resetDropFlow();
    navigation.reset({ index: 0, routes: [{ name: 'Map' }] });
  };

  const onSelect = (s: Song) => {
    cacheSongs([s]);
    setDropSong(s.id);
  };

  const showEmpty = !!dropQuery.trim() && results.length === 0 && !loading;

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 17 }]}>
        <Pressable onPress={exitToMap} accessibilityRole="button" accessibilityLabel="닫기" style={styles.iconBtn}>
          <Close size={19} color="#fff" strokeWidth={2.2} />
        </Pressable>
        <Text style={styles.title}>음악 선택</Text>
        <View style={{ width: 42 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.searchBox}>
          <Search size={18} color="rgba(255,255,255,0.45)" strokeWidth={2} />
          <TextInput
            value={dropQuery}
            onChangeText={setDropQuery}
            placeholder={spotifySearchConfigured ? 'Spotify에서 곡·아티스트 검색' : '곡 제목, 아티스트 검색'}
            placeholderTextColor="rgba(255,255,255,0.4)"
            autoCorrect={false}
            style={styles.input}
          />
          {loading && <ActivityIndicator size="small" color="rgba(255,255,255,0.5)" />}
        </View>

        {!dropQuery.trim() ? (
          <Text style={styles.hint}>
            {spotifySearchConfigured ? 'Spotify에서 드랍할 곡을 검색해보세요.' : '곡을 검색해보세요.'}
          </Text>
        ) : showEmpty ? (
          <Text style={styles.hint}>검색 결과가 없어요.</Text>
        ) : null}

        <View style={{ marginTop: 10, paddingBottom: 14, gap: 2 }}>
          {results.map((s) => {
            const selected = s.id === dropSongId;
            return (
              <Pressable
                key={s.id}
                onPress={() => onSelect(s)}
                style={[styles.row, selected && styles.rowSelected]}
              >
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
        <Pressable onPress={() => navigation.navigate('Drop')}>
          <SignatureGradient style={styles.cta}>
            <Text style={styles.ctaText}>다음</Text>
            <ArrowRight size={18} color="#2a1530" strokeWidth={2.6} />
          </SignatureGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgBase },
  header: { paddingTop: 64, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: font.serifBold, fontSize: 18, color: '#fff' },
  scroll: { paddingHorizontal: 24, paddingTop: 22 },
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
