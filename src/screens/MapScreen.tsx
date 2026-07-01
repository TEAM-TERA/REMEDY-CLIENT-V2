/**
 * Main / Map — full-screen Google map (RealMap) with floating top bar, a
 * notifications bell (unread badge), right-side now-playing disc, and the bottom
 * dock (profile + recenter + 드랍 CTA).
 *
 * On focus it refreshes location → nearby drops + my likes (backend). Pin taps
 * branch by drop type: MUSIC selects (disc → player), VOTE opens the vote screen,
 * PLAYLIST plays the drop's tracks in the player.
 */
import React, { useCallback, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RealMap, type RealMapHandle } from '@/components/map/RealMap';
import { NowPlayingDisc } from '@/components/anim/NowPlayingDisc';
import { Toast } from '@/components/anim/Toast';
import { Avatar } from '@/components/Avatar';
import { GlassView } from '@/components/GlassView';
import { SignatureGradient } from '@/components/Gradient';
import { Bell, ChevronDown, DropMark, LocationPin, Recenter } from '@/components/Icons';
import { colors, font, gradients, radii, shadows } from '@/theme/tokens';
import { useAppStore } from '@/store/useAppStore';
import { useAuthStore } from '@/store/useAuthStore';
import { getUnreadCount, getPlaylistDropDetail } from '@/services/backend';
import type { RootStackParamList } from '@/navigation/types';

const GLOW = ['255,143,182', '124,198,255', '255,216,110'];

export default function MapScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const mapVariant = useAppStore((s) => s.mapVariant);
  const drops = useAppStore((s) => s.drops);
  const selectedDropId = useAppStore((s) => s.selectedDropId);
  const playing = useAppStore((s) => s.playing);
  const selectPin = useAppStore((s) => s.selectPin);
  const openDrop = useAppStore((s) => s.openDrop);
  const togglePlay = useAppStore((s) => s.togglePlay);
  const lookupDrop = useAppStore((s) => s.lookupDrop);
  const lookupSong = useAppStore((s) => s.lookupSong);
  const userLocationLabel = useAppStore((s) => s.userLocationLabel);
  const refreshLocation = useAppStore((s) => s.refreshLocation);
  const loadNearbyDrops = useAppStore((s) => s.loadNearbyDrops);
  const loadLikes = useAppStore((s) => s.loadLikes);
  const loadDropSocial = useAppStore((s) => s.loadDropSocial);
  const cacheSongs = useAppStore((s) => s.cacheSongs);
  const playQueue = useAppStore((s) => s.playQueue);
  const resetDropFlow = useAppStore((s) => s.resetDropFlow);
  const username = useAuthStore((s) => s.user?.username ?? '나');

  const [unread, setUnread] = useState(0);
  const selected = lookupDrop(selectedDropId);
  const mapRef = useRef<RealMapHandle>(null);

  // refresh on focus: location → nearby drops + likes + unread badge
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        await refreshLocation();
        if (!alive) return;
        await Promise.all([loadLikes(), loadNearbyDrops()]);
        try {
          const n = await getUnreadCount();
          if (alive) setUnread(n);
        } catch {
          /* ignore */
        }
      })();
      return () => {
        alive = false;
      };
    }, [refreshLocation, loadNearbyDrops, loadLikes]),
  );

  const onRecenter = () => mapRef.current?.recenter();

  const onSelectDrop = async (id: string) => {
    const d = drops.find((x) => x.id === id);
    if (!d) return;
    if (d.dropType === 'VOTE') {
      navigation.navigate('VoteDrop', { dropId: id });
      return;
    }
    if (d.dropType === 'PLAYLIST') {
      try {
        const detail = await getPlaylistDropDetail(id);
        const songs = detail.songs.map((s) => ({ id: s.songId, title: s.title, artist: s.artist, artworkUrl: s.albumImagePath }));
        cacheSongs(songs);
        const queue = songs.map((s) => ({ songId: s.id, dropId: id }));
        if (queue.length) {
          playQueue(queue, 0);
          navigation.navigate('Player');
        }
      } catch {
        /* ignore */
      }
      return;
    }
    selectPin(id);
    loadDropSocial(id);
  };

  return (
    <View style={styles.root}>
      <RealMap
        ref={mapRef}
        variant={mapVariant}
        drops={drops}
        selectedDropId={selectedDropId}
        glowFor={(i) => GLOW[i % GLOW.length]}
        artworkFor={(songId) => lookupSong(songId).artworkUrl}
        onSelectDrop={onSelectDrop}
      />

      {/* top bar */}
      <View style={[styles.topBar, { top: insets.top + 13 }]}>
        <GlassView style={styles.locChip} overlay={colors.glass}>
          <LocationPin size={15} color={colors.pink} strokeWidth={2.4} />
          <Text style={styles.locText} numberOfLines={1}>{userLocationLabel}</Text>
          <View style={styles.chevWrap}>
            <ChevronDown size={13} />
          </View>
        </GlassView>
        <Pressable onPress={() => navigation.navigate('Notifications')} accessibilityRole="button" accessibilityLabel="알림">
          <GlassView style={styles.searchBtn} overlay={colors.glass}>
            <Bell size={18} color="#fff" strokeWidth={2} />
            {unread > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unread > 9 ? '9+' : unread}</Text>
              </View>
            )}
          </GlassView>
        </Pressable>
      </View>

      {/* right-side now playing disc (only when a MUSIC drop is selected) */}
      {selected && selected.dropType === 'MUSIC' && (
        <View style={styles.disc}>
          <NowPlayingDisc
            songId={selected.songId}
            artworkUrl={lookupSong(selected.songId).artworkUrl}
            playing={playing}
            onPressDisc={() => {
              openDrop(selected.id);
              navigation.navigate('Player');
            }}
            onPressToggle={togglePlay}
          />
        </View>
      )}

      {/* bottom dock */}
      <View style={[styles.dock, { bottom: insets.bottom + 6 }]}>
        <GlassView style={styles.dockPill} overlay={colors.glassDock}>
          <Pressable onPress={() => navigation.navigate('Profile')} accessibilityRole="button" accessibilityLabel="프로필">
            <Avatar
              name={username}
              size={48}
              fontSize={14}
              colors={gradients.meAvatar}
              locations={gradients.meAvatarLocations}
              borderColor="rgba(255,255,255,0.4)"
              borderWidth={2}
              boxShadow="inset 0 2px 5px rgba(255,255,255,0.35), 0 4px 12px rgba(0,0,0,0.3)"
            />
          </Pressable>
          <Pressable onPress={onRecenter} accessibilityRole="button" accessibilityLabel="내 위치로" style={styles.recenter}>
            <Recenter size={21} color={colors.pink} strokeWidth={2} />
          </Pressable>
        </GlassView>

        <Pressable onPress={() => { resetDropFlow(); navigation.navigate('DropSearch'); }} accessibilityRole="button" accessibilityLabel="드랍하기">
          <SignatureGradient style={styles.dropCta}>
            <DropMark size={22} color="#2a1530" strokeWidth={2.4} />
            <Text style={styles.dropLabel}>드랍</Text>
          </SignatureGradient>
        </Pressable>
      </View>

      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgBase },

  topBar: { position: 'absolute', top: 60, left: 16, right: 16, zIndex: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  locChip: { height: 44, borderRadius: 22, flexDirection: 'row', alignItems: 'center', gap: 9, paddingLeft: 15, paddingRight: 10 },
  locText: { fontFamily: font.bold, fontSize: 14, color: '#fff' },
  chevWrap: { width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  searchBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: -3, right: -3, minWidth: 18, height: 18, paddingHorizontal: 4, borderRadius: 9, backgroundColor: colors.pinkDeep, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.bgBase },
  badgeText: { fontFamily: font.bold, fontSize: 10, color: '#fff' },

  disc: { position: 'absolute', right: 14, top: '46%', marginTop: -40, zIndex: 45 },

  dock: { position: 'absolute', left: 16, right: 16, bottom: 30, zIndex: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dockPill: { flexDirection: 'row', alignItems: 'center', gap: 7, padding: 6, borderRadius: radii.dockPill, boxShadow: '0 10px 28px rgba(0,0,0,0.4)' },
  recenter: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.07)', alignItems: 'center', justifyContent: 'center' },
  dropCta: { flexDirection: 'row', alignItems: 'center', gap: 9, height: 56, paddingHorizontal: 26, borderRadius: radii.pill, boxShadow: shadows.cta },
  dropLabel: { fontFamily: font.extrabold, fontSize: 16, color: '#2a1530' },
});
