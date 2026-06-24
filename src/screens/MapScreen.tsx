/**
 * Main / Map — README §4.2. Full-screen Google map (RealMap, M2) with floating
 * top bar, right-side now-playing disc, and bottom dock (profile + recenter +
 * 드랍 CTA). Drop markers, user dot, and the two display variants live in RealMap.
 */
import React, { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RealMap, type RealMapHandle } from '@/components/map/RealMap';
import { NowPlayingDisc } from '@/components/anim/NowPlayingDisc';
import { Toast } from '@/components/anim/Toast';
import { Avatar } from '@/components/Avatar';
import { GlassView } from '@/components/GlassView';
import { SignatureGradient } from '@/components/Gradient';
import { ChevronDown, DropMark, LocationPin, Recenter, Search } from '@/components/Icons';
import { colors, font, gradients, radii, shadows } from '@/theme/tokens';
import { ME } from '@/data/mock';
import { useAppStore } from '@/store/useAppStore';
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

  const selected = lookupDrop(selectedDropId);
  const mapRef = useRef<RealMapHandle>(null);

  // resolve the device's real location (동 label + address) once on mount
  useEffect(() => {
    refreshLocation();
  }, [refreshLocation]);

  // Recenter the real map camera on the user's location.
  const onRecenter = () => mapRef.current?.recenter();

  return (
    <View style={styles.root}>
      <RealMap
        ref={mapRef}
        variant={mapVariant}
        drops={drops}
        selectedDropId={selectedDropId}
        glowFor={(i) => GLOW[i % GLOW.length]}
        artworkFor={(songId) => lookupSong(songId).artworkUrl}
        onSelectDrop={selectPin}
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
        <GlassView style={styles.searchBtn} overlay={colors.glass}>
          <Search size={18} color="#fff" strokeWidth={2} />
        </GlassView>
      </View>

      {/* right-side now playing disc (only when a drop is selected) */}
      {selected && (
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
          <Pressable
            onPress={() => navigation.navigate('Profile')}
            accessibilityRole="button"
            accessibilityLabel="프로필"
          >
            <Avatar
              name={ME.displayName}
              size={48}
              fontSize={14}
              colors={gradients.meAvatar}
              locations={gradients.meAvatarLocations}
              borderColor="rgba(255,255,255,0.4)"
              borderWidth={2}
              boxShadow="inset 0 2px 5px rgba(255,255,255,0.35), 0 4px 12px rgba(0,0,0,0.3)"
            />
          </Pressable>
          <Pressable
            onPress={onRecenter}
            accessibilityRole="button"
            accessibilityLabel="내 위치로"
            style={styles.recenter}
          >
            <Recenter size={21} color={colors.pink} strokeWidth={2} />
          </Pressable>
        </GlassView>

        <Pressable
          onPress={() => navigation.navigate('DropSearch')}
          accessibilityRole="button"
          accessibilityLabel="드랍하기"
        >
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

  disc: { position: 'absolute', right: 14, top: '46%', marginTop: -40, zIndex: 45 },

  dock: { position: 'absolute', left: 16, right: 16, bottom: 30, zIndex: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dockPill: { flexDirection: 'row', alignItems: 'center', gap: 7, padding: 6, borderRadius: radii.dockPill, boxShadow: '0 10px 28px rgba(0,0,0,0.4)' },
  recenter: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.07)', alignItems: 'center', justifyContent: 'center' },
  dropCta: { flexDirection: 'row', alignItems: 'center', gap: 9, height: 56, paddingHorizontal: 26, borderRadius: radii.pill, boxShadow: shadows.cta },
  dropLabel: { fontFamily: font.extrabold, fontSize: 16, color: '#2a1530' },
});
