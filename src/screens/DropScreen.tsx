/**
 * Drop step 2 — README §4.5. Selected song + message + location + map preview,
 * then confirm. M3/M4: POST current GPS + song + note to the backend
 * (drops.createDrop); reverse-geocode for the address label.
 */
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SongCover } from '@/components/SongCover';
import { MiniMap } from '@/components/map/MiniMap';
import { RingPulse } from '@/components/anim/RingPulse';
import { ChevronLeft, LocationPin } from '@/components/Icons';
import { colors, font } from '@/theme/tokens';
import { useAppStore } from '@/store/useAppStore';
import type { RootStackParamList } from '@/navigation/types';

export default function DropScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const dropSongId = useAppStore((s) => s.dropSongId);
  const note = useAppStore((s) => s.note);
  const setNote = useAppStore((s) => s.setNote);
  const confirmDrop = useAppStore((s) => s.confirmDrop);
  const resetDropFlow = useAppStore((s) => s.resetDropFlow);
  const lookupSong = useAppStore((s) => s.lookupSong);
  const userAddress = useAppStore((s) => s.userAddress);

  const song = lookupSong(dropSongId);
  const goMap = () => navigation.reset({ index: 0, routes: [{ name: 'Map' }] });
  const onCancel = () => {
    resetDropFlow();
    goMap();
  };
  const onConfirm = () => {
    confirmDrop(); // shows toast on Map, clears note
    resetDropFlow(); // also clear the search query / selection for next time
    goMap();
  };

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 17 }]}>
        <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="뒤로" style={styles.iconBtn}>
          <ChevronLeft size={20} color="#fff" strokeWidth={2.2} />
        </Pressable>
        <Text style={styles.title}>이야기 남기기</Text>
        <View style={{ width: 42 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* selected song */}
        <View style={styles.songHead}>
          <SongCover songId={song.id} artworkUrl={song.artworkUrl} size={56} radius={12} />
          <View style={{ flex: 1 }}>
            <Text style={styles.songTitle} numberOfLines={1}>{song.title}</Text>
            <Text style={styles.songArtist}>{song.artist}</Text>
          </View>
          <Pressable onPress={() => navigation.goBack()} style={styles.changeBtn}>
            <Text style={styles.changeText}>변경</Text>
          </Pressable>
        </View>

        {/* message */}
        <View style={styles.messageBox}>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="함께 남길 이야기"
            placeholderTextColor="rgba(255,255,255,0.4)"
            maxLength={200}
            multiline
            style={styles.textarea}
          />
          <Text style={styles.counter}>{note.length}/200</Text>
        </View>

        {/* location */}
        <View style={styles.locRow}>
          <LocationPin size={16} color="#ff7ea8" strokeWidth={2} />
          <Text style={styles.locText} numberOfLines={1}>{userAddress}</Text>
        </View>

        {/* map preview (real map centered on current location) */}
        <View style={styles.mapPreview}>
          <MiniMap style={StyleSheet.absoluteFill} spanKm={1} />
          {/* top-right corner triangle */}
          <View style={styles.corner} />
          {/* center pin */}
          <View style={styles.pinWrap} pointerEvents="none">
            <RingPulse size={60} />
            <SongCover songId={song.id} artworkUrl={song.artworkUrl} size={44} radius={10} innerBorder={false} style={styles.pin} />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable onPress={onCancel} style={styles.cancelBtn}>
          <Text style={styles.cancelText}>취소</Text>
        </Pressable>
        <Pressable onPress={onConfirm} style={styles.confirmBtn}>
          <Text style={styles.confirmText}>여기에 드랍</Text>
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
  scroll: { paddingHorizontal: 24, paddingTop: 22, paddingBottom: 24 },

  songHead: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 12, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  songTitle: { fontFamily: font.serifBold, fontSize: 18, color: '#fff' },
  songArtist: { fontFamily: font.regular, fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 2 },
  changeBtn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  changeText: { fontFamily: font.semibold, fontSize: 13, color: 'rgba(255,255,255,0.75)' },

  messageBox: { marginTop: 22, borderRadius: 18, padding: 18, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', minHeight: 130 },
  textarea: { height: 110, color: '#fff', fontFamily: font.regular, fontSize: 15, lineHeight: 24, textAlignVertical: 'top', padding: 0 },
  counter: { position: 'absolute', bottom: 14, right: 16, fontFamily: font.regular, fontSize: 12, color: 'rgba(255,255,255,0.4)' },

  locRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 22 },
  locText: { fontFamily: font.regular, fontSize: 14, color: 'rgba(255,255,255,0.7)' },

  mapPreview: { marginTop: 14, borderRadius: 18, overflow: 'hidden', height: 280, backgroundColor: '#15121f', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  corner: { position: 'absolute', top: 0, right: 0, width: 0, height: 0, borderTopWidth: 0, borderRightWidth: 54, borderBottomWidth: 54, borderLeftWidth: 0, borderTopColor: 'transparent', borderRightColor: '#ff7ea8', borderBottomColor: 'transparent', borderLeftColor: 'transparent' },
  pinWrap: { position: 'absolute', left: '50%', top: '50%', width: 44, height: 44, marginLeft: -22, marginTop: -22, alignItems: 'center', justifyContent: 'center' },
  pin: { boxShadow: '0 0 0 3px #ff7ea8, 0 8px 20px rgba(0,0,0,0.6)' },

  footer: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 34, flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, height: 58, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  cancelText: { fontFamily: font.bold, fontSize: 16, color: 'rgba(255,255,255,0.8)' },
  confirmBtn: { flex: 1.3, height: 58, borderRadius: 16, backgroundColor: '#ff7ea8', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 26px -8px rgba(255,126,168,0.6)' },
  confirmText: { fontFamily: font.bold, fontSize: 16, color: '#fff' },
});
