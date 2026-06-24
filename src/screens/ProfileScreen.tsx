/**
 * Profile — README §4.6. Profile header + 3 tabs (플레이리스트 / 드랍 기록 / 좋아요).
 */
import React from 'react';
import { Alert, Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { G, Line, Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SongCover } from '@/components/SongCover';
import { Avatar } from '@/components/Avatar';
import { ArrowRight, ChevronLeft, DotsHorizontal, DotsVertical, Heart, LocationPin } from '@/components/Icons';
import { colors, font, gradients } from '@/theme/tokens';
import { ME } from '@/data/mock';
import { useAppStore } from '@/store/useAppStore';
import type { RootStackParamList } from '@/navigation/types';

const W = Dimensions.get('window').width;
const COL = (W - 22 * 2 - 16) / 2;

const TABS = [
  { key: 'playlists', label: '플레이리스트' },
  { key: 'drops', label: '드랍 기록' },
  { key: 'likes', label: '좋아요' },
] as const;

export default function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const profileTab = useAppStore((s) => s.profileTab);
  const setProfileTab = useAppStore((s) => s.setProfileTab);
  const openDrop = useAppStore((s) => s.openDrop);
  const playQueue = useAppStore((s) => s.playQueue);
  const setPlaylist = useAppStore((s) => s.setPlaylist);
  const likedSongIds = useAppStore((s) => s.likedSongIds);

  return (
    <ScrollView style={styles.root} showsVerticalScrollIndicator={false}>
      {/* top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 15 }]}>
        <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="뒤로" style={styles.backBtn}>
          <ChevronLeft size={20} color="#fff" strokeWidth={2.2} />
        </Pressable>
        <Text style={styles.topTitle}>프로필</Text>
      </View>

      {/* profile row */}
      <View style={styles.profileRow}>
        <Avatar
          name={ME.displayName}
          size={70}
          fontSize={22}
          square
          colors={gradients.meAvatar}
          locations={gradients.meAvatarLocations}
          boxShadow="inset 0 2px 8px rgba(255,255,255,0.25), 0 6px 16px rgba(0,0,0,0.35)"
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{ME.displayName}</Text>
          <Text style={styles.email} numberOfLines={1}>{ME.email}</Text>
        </View>
        <Pressable onPress={() => navigation.navigate('Settings')} accessibilityRole="button" accessibilityLabel="설정" style={styles.dotsBtn}>
          <DotsVertical size={20} color="rgba(255,255,255,0.5)" />
        </Pressable>
      </View>

      {/* tabs */}
      <View style={styles.tabs}>
        {TABS.map((t) => {
          const active = profileTab === t.key;
          return (
            <Pressable key={t.key} onPress={() => setProfileTab(t.key)}>
              <Text style={[styles.tab, active ? styles.tabActive : styles.tabInactive]}>{t.label}</Text>
            </Pressable>
          );
        })}
        <View style={{ flex: 1 }} />
        <ArrowRight size={22} color="rgba(255,255,255,0.5)" strokeWidth={2} />
      </View>

      {profileTab === 'drops' && <DropsTab onOpen={(id) => { openDrop(id); navigation.navigate('Player'); }} />}
      {profileTab === 'playlists' && (
        <PlaylistsTab onOpen={(id) => { setPlaylist(id); navigation.navigate('Playlist'); }} />
      )}
      {profileTab === 'likes' && (
        <LikesTab
          onOpen={(id) => {
            const i = likedSongIds.indexOf(id);
            playQueue(likedSongIds.map((sid) => ({ songId: sid })), i < 0 ? 0 : i);
            navigation.navigate('Player');
          }}
        />
      )}
    </ScrollView>
  );
}

function DropsTab({ onOpen }: { onOpen: (id: string) => void }) {
  const drops = useAppStore((s) => s.drops);
  const lookupSong = useAppStore((s) => s.lookupSong);
  const userAddress = useAppStore((s) => s.userAddress);

  if (drops.length === 0) {
    return <Text style={styles.emptyDrops}>아직 드랍한 곡이 없어요.{'\n'}지도에서 음악을 드랍해보세요.</Text>;
  }

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dropRow}>
        {drops.map((d) => (
          <Pressable key={d.id} onPress={() => onOpen(d.id)} style={styles.dropCard}>
            <SongCover songId={d.songId} artworkUrl={lookupSong(d.songId).artworkUrl} size={80} radius={13} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <Text style={styles.dropTitle} numberOfLines={1}>{lookupSong(d.songId).title}</Text>
                <DotsHorizontal size={16} />
              </View>
              <Text style={styles.dropNote} numberOfLines={1}>{d.note || '메시지 없이 남긴 곡'}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 11 }}>
                <Avatar name={d.authorName} size={22} />
                <Text style={styles.dropDate}>{d.dateLabel}</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.dropLocRow}>
        <LocationPin size={15} color={colors.pink} strokeWidth={2} />
        <Text style={styles.dropLocText} numberOfLines={1}>{userAddress}</Text>
      </View>

      <View style={{ paddingHorizontal: 22, paddingTop: 12, paddingBottom: 40 }}>
        <View style={styles.miniMap}>
          <Svg width="100%" height="100%" viewBox="0 0 340 188" preserveAspectRatio="xMidYMid slice">
            <G stroke="#262436" strokeWidth={7} fill="none" strokeLinecap="round">
              <Path d="M-10 70 C 80 50 140 100 210 80 S 330 50 360 70" />
              <Path d="M40 -10 C 60 70 30 130 70 200" />
              <Path d="M-10 140 C 120 120 220 150 360 130" />
              <Path d="M250 -10 C 240 70 270 140 250 200" />
            </G>
            <Line x1={-10} y1={165} x2={350} y2={150} stroke="#332f44" strokeWidth={2.5} strokeDasharray="3 7" />
            <Path d="M210 200 C 250 165 300 158 350 168" stroke="#ff9ec4" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.7} />
          </Svg>
          <MiniPin left="30%" top="42%" size={26} radius={9} colors={['#ff8fb6', '#8e0b3a']} glow="255,143,182" />
          <MiniPin left="58%" top="58%" size={22} radius={8} colors={['#7cc6ff', '#11337a']} glow="124,198,255" />
          <MiniPin left="74%" top="34%" size={20} radius={7} colors={['#ffd86e', '#b5591a']} glow="255,216,110" />
        </View>
      </View>
    </View>
  );
}

function MiniPin({ left, top, size, radius, colors: cols, glow }: { left: string; top: string; size: number; radius: number; colors: [string, string]; glow: string }) {
  return (
    <LinearGradient
      colors={cols}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        position: 'absolute',
        left: left as `${number}%`,
        top: top as `${number}%`,
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        borderRadius: radius,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.7)',
        boxShadow: `0 4px 12px rgba(${glow},0.5)`,
      }}
    />
  );
}

function PlaylistsTab({ onOpen }: { onOpen: (id: string) => void }) {
  const playlists = useAppStore((s) => s.playlists);
  const lookupSong = useAppStore((s) => s.lookupSong);
  const createPlaylist = useAppStore((s) => s.createPlaylist);

  const onCreate = () => {
    Alert.prompt('새 플레이리스트', '이름을 입력하세요', (name) => {
      const trimmed = (name ?? '').trim();
      if (!trimmed) return;
      const id = createPlaylist(trimmed);
      onOpen(id);
    });
  };

  return (
    <View style={styles.grid}>
      {playlists.map((p) => {
        const cover = p.songIds[0];
        return (
          <Pressable key={p.id} onPress={() => onOpen(p.id)} style={{ width: COL, marginBottom: 16 }}>
            <SongCover songId={cover} artworkUrl={cover ? lookupSong(cover).artworkUrl : undefined} size={COL} radius={16} />
            <Text style={styles.gridName} numberOfLines={1}>{p.name}</Text>
            <Text style={styles.gridCount}>{p.songIds.length}곡</Text>
          </Pressable>
        );
      })}
      {/* create */}
      <Pressable onPress={onCreate} style={{ width: COL, marginBottom: 16 }}>
        <View style={[styles.createCover, { width: COL, height: COL }]}>
          <Text style={styles.createPlus}>+</Text>
        </View>
        <Text style={styles.gridName} numberOfLines={1}>새 플레이리스트</Text>
        <Text style={styles.gridCount}>만들기</Text>
      </Pressable>
    </View>
  );
}

function LikesTab({ onOpen }: { onOpen: (id: string) => void }) {
  const likedSongIds = useAppStore((s) => s.likedSongIds);
  const lookupSong = useAppStore((s) => s.lookupSong);
  const toggleLikedSong = useAppStore((s) => s.toggleLikedSong);

  if (likedSongIds.length === 0) {
    return <Text style={styles.emptyDrops}>아직 좋아요한 곡이 없어요.{'\n'}플레이어에서 하트를 눌러 담아보세요.</Text>;
  }

  return (
    <View style={styles.likes}>
      {likedSongIds.map((id) => {
        const s = lookupSong(id);
        return (
          <Pressable key={id} onPress={() => onOpen(id)} style={styles.likeRow}>
            <SongCover songId={id} artworkUrl={s.artworkUrl} size={52} radius={10} />
            <View style={{ flex: 1 }}>
              <Text style={styles.likeTitle} numberOfLines={1}>{s.title}</Text>
              <Text style={styles.likeArtist} numberOfLines={1}>{s.artist}</Text>
            </View>
            <Pressable onPress={() => toggleLikedSong(id)} hitSlop={10} accessibilityRole="button" accessibilityLabel="좋아요 취소">
              <Heart size={20} filled color={colors.pink} />
            </Pressable>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgBase },
  topBar: { paddingTop: 62, paddingHorizontal: 22, paddingBottom: 2, flexDirection: 'row', alignItems: 'center', gap: 13 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  topTitle: { fontFamily: font.serifBold, fontSize: 21, color: 'rgba(255,255,255,0.82)' },

  profileRow: { paddingHorizontal: 22, paddingTop: 20, flexDirection: 'row', alignItems: 'center', gap: 15 },
  name: { fontFamily: font.serifBold, fontSize: 24, color: '#fff' },
  email: { fontFamily: font.regular, fontSize: 13.5, color: 'rgba(255,255,255,0.45)', marginTop: 4 },
  dotsBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },

  tabs: { flexDirection: 'row', alignItems: 'center', gap: 20, paddingHorizontal: 22, paddingTop: 26 },
  tab: { fontFamily: font.extrabold, fontSize: 16.5, paddingBottom: 5, borderBottomWidth: 2 },
  tabActive: { color: colors.pink, borderBottomColor: colors.pink },
  tabInactive: { color: 'rgba(255,255,255,0.4)', borderBottomColor: 'transparent' },

  dropRow: { gap: 14, paddingHorizontal: 22, paddingTop: 18, paddingBottom: 4 },
  dropCard: { width: 284, flexDirection: 'row', gap: 13, padding: 13, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.045)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  dropTitle: { flex: 1, fontFamily: font.serifBold, fontSize: 16, color: colors.pink },
  dropNote: { fontFamily: font.regular, fontSize: 13, lineHeight: 19, color: 'rgba(255,255,255,0.75)', marginTop: 6 },
  dropDate: { fontFamily: font.regular, fontSize: 11.5, color: 'rgba(255,255,255,0.4)' },
  dropLocRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 22, paddingTop: 16 },
  dropLocText: { fontFamily: font.regular, fontSize: 13.5, color: 'rgba(255,255,255,0.6)' },
  miniMap: { height: 188, borderRadius: 18, overflow: 'hidden', backgroundColor: '#0e0c16', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 22, paddingTop: 18, paddingBottom: 40 },
  gridName: { fontFamily: font.bold, fontSize: 15, color: '#fff', marginTop: 10 },
  gridCount: { fontFamily: font.regular, fontSize: 12.5, color: 'rgba(255,255,255,0.45)', marginTop: 3 },
  createCover: { borderRadius: 16, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)', borderStyle: 'dashed', backgroundColor: 'rgba(255,255,255,0.03)', alignItems: 'center', justifyContent: 'center' },
  createPlus: { fontFamily: font.regular, fontSize: 44, color: 'rgba(255,255,255,0.45)', marginTop: -4 },

  emptyDrops: { fontFamily: font.regular, fontSize: 14, lineHeight: 22, color: 'rgba(255,255,255,0.45)', textAlign: 'center', paddingHorizontal: 22, paddingTop: 50, paddingBottom: 40 },
  likes: { paddingHorizontal: 22, paddingTop: 18, paddingBottom: 40, gap: 16 },
  likeRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  likeTitle: { fontFamily: font.semibold, fontSize: 15, color: '#fff' },
  likeArtist: { fontFamily: font.regular, fontSize: 12.5, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
});
