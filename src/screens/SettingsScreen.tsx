/**
 * Settings — README §4.8. Map display mode, playback services, account.
 */
import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SegmentGradient } from '@/components/Gradient';
import { AppleGlyph, Check, ChevronRight, ChevronLeft, SpotifyGlyph, YouTubeGlyph } from '@/components/Icons';
import { colors, font } from '@/theme/tokens';
import { SERVICES } from '@/data/mock';
import { withdrawAccount } from '@/services/backend';
import { useAppStore } from '@/store/useAppStore';
import { useAuthStore } from '@/store/useAuthStore';
import type { RootStackParamList } from '@/navigation/types';
import type { ServiceId } from '@/types';

const MAP_OPTIONS: { label: string; value: 0 | 1 }[] = [
  { label: '그라데이션', value: 0 },
  { label: '반경', value: 1 },
];

export default function SettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const mapVariant = useAppStore((s) => s.mapVariant);
  const setMapVariant = useAppStore((s) => s.setMapVariant);
  const services = useAppStore((s) => s.services);
  const defaultService = useAppStore((s) => s.defaultService);
  const setDefaultService = useAppStore((s) => s.setDefaultService);
  const connectService = useAppStore((s) => s.connectService);
  const signOut = useAuthStore((s) => s.signOut);

  const onLogout = async () => {
    await signOut();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const onWithdraw = () => {
    Alert.alert('회원 탈퇴', '계정과 모든 드랍이 삭제돼요. 정말 탈퇴할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '탈퇴',
        style: 'destructive',
        onPress: async () => {
          try {
            await withdrawAccount();
          } catch {
            /* proceed to sign-out regardless */
          }
          await signOut();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  };

  const glyphFor = (id: ServiceId) =>
    id === 'spotify' ? <SpotifyGlyph size={26} /> : id === 'apple' ? <AppleGlyph size={22} /> : <YouTubeGlyph size={28} />;

  return (
    <ScrollView style={styles.root} showsVerticalScrollIndicator={false}>
      <View style={[styles.topBar, { paddingTop: insets.top + 17 }]}>
        <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="뒤로" style={styles.backBtn}>
          <ChevronLeft size={20} color="#fff" strokeWidth={2.2} />
        </Pressable>
        <Text style={styles.topTitle}>설정</Text>
      </View>

      <View style={styles.body}>
        {/* map display */}
        <Text style={styles.sectionLabel}>지도 표시</Text>
        <View style={styles.segment}>
          {MAP_OPTIONS.map((o) => {
            const active = mapVariant === o.value;
            return (
              <Pressable key={o.value} onPress={() => setMapVariant(o.value)} style={{ flex: 1 }}>
                {active ? (
                  <SegmentGradient style={styles.segOption}>
                    <Text style={[styles.segText, { color: '#3a1622' }]}>{o.label}</Text>
                  </SegmentGradient>
                ) : (
                  <View style={styles.segOption}>
                    <Text style={[styles.segText, { color: 'rgba(255,255,255,0.55)' }]}>{o.label}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.caption}>핀이 떨어진 거리를 지도에서 보여주는 방식을 선택해요.</Text>

        {/* streaming */}
        <Text style={[styles.sectionLabel, { marginTop: 28 }]}>재생 서비스</Text>
        <View style={styles.serviceRow}>
          {SERVICES.map((s) => {
            const on = services[s.id];
            const isDefault = on && defaultService === s.id;
            return (
              <Pressable
                key={s.id}
                onPress={() => (on ? setDefaultService(s.id) : connectService(s.id))}
                style={[styles.tile, isDefault ? styles.tileDefault : styles.tileNormal]}
              >
                <View style={[styles.badge, { backgroundColor: s.color, opacity: on ? 1 : 0.45, boxShadow: on ? `0 6px 16px ${s.color}55` : undefined }]}>
                  {glyphFor(s.id)}
                </View>
                <Text style={styles.tileName}>{s.shortName}</Text>
                {isDefault ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Check size={13} color={colors.pink} strokeWidth={3.2} />
                    <Text style={[styles.status, { color: colors.pink, fontFamily: font.bold }]}>재생 중</Text>
                  </View>
                ) : on ? (
                  <Text style={[styles.status, { color: 'rgba(255,255,255,0.4)' }]}>연결됨</Text>
                ) : (
                  <Text style={[styles.status, { color: colors.pink, fontFamily: font.bold }]}>+ 연결</Text>
                )}
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.caption}>서비스를 탭해 연결하거나 기본 재생으로 설정해요.</Text>

        {/* account */}
        <Text style={[styles.sectionLabel, { marginTop: 26 }]}>계정</Text>
        <View style={styles.accountCard}>
          <Pressable onPress={() => navigation.navigate('ProfileEdit')} style={[styles.accountRow, styles.accountDivider]}>
            <Text style={styles.accountText}>프로필 편집</Text>
            <ChevronRight size={18} color="rgba(255,255,255,0.4)" strokeWidth={2} />
          </Pressable>
          <Pressable onPress={() => navigation.navigate('Notifications')} style={[styles.accountRow, styles.accountDivider]}>
            <Text style={styles.accountText}>알림</Text>
            <ChevronRight size={18} color="rgba(255,255,255,0.4)" strokeWidth={2} />
          </Pressable>
          <Pressable onPress={onLogout} style={[styles.accountRow, styles.accountDivider]}>
            <Text style={[styles.accountText, { color: '#ff9cbb', fontFamily: font.semibold }]}>로그아웃</Text>
          </Pressable>
          <Pressable onPress={onWithdraw} style={styles.accountRow}>
            <Text style={[styles.accountText, { color: 'rgba(255,255,255,0.45)' }]}>회원 탈퇴</Text>
          </Pressable>
        </View>
        <Text style={styles.version}>RE:MEDY v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgBase },
  topBar: { paddingTop: 64, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', gap: 14 },
  backBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  topTitle: { fontFamily: font.serifBold, fontSize: 24, color: '#fff' },

  body: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 40 },
  sectionLabel: { fontFamily: font.bold, fontSize: 13, letterSpacing: 0.5, color: 'rgba(255,255,255,0.45)', marginBottom: 12 },
  caption: { fontFamily: font.regular, fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 10, lineHeight: 18 },

  segment: { flexDirection: 'row', gap: 4, padding: 4, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  segOption: { paddingVertical: 12, borderRadius: 11, alignItems: 'center' },
  segText: { fontFamily: font.bold, fontSize: 14 },

  serviceRow: { flexDirection: 'row', gap: 10 },
  tile: { flex: 1, alignItems: 'center', gap: 10, paddingTop: 18, paddingBottom: 16, paddingHorizontal: 6, borderRadius: 20 },
  tileDefault: { backgroundColor: 'rgba(255,143,182,0.1)', borderWidth: 1.5, borderColor: 'rgba(255,143,182,0.5)', boxShadow: '0 10px 26px -12px rgba(255,143,182,0.55)' },
  tileNormal: { backgroundColor: 'rgba(255,255,255,0.035)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  badge: { width: 50, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  tileName: { fontFamily: font.bold, fontSize: 13.5, color: '#fff' },
  status: { fontFamily: font.regular, fontSize: 11 },

  accountCard: { borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  accountRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  accountDivider: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  accountText: { flex: 1, fontFamily: font.regular, fontSize: 15, color: '#fff' },
  version: { textAlign: 'center', marginTop: 22, fontFamily: font.regular, fontSize: 12, color: 'rgba(255,255,255,0.3)' },
});
