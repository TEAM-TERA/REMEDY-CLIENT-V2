/**
 * Login — README §4.1. Floating color glows + bottom-aligned content with the
 * RE:MEDY logo and 3 OAuth buttons.
 * M1: any button = mock sign-in → Map. M3: Spotify button runs the real PKCE
 * flow (see src/services/spotify.ts buildAuthRequestConfig).
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppBackground } from '@/components/AppBackground';
import { DriftGlow } from '@/components/anim/DriftGlow';
import { AppleDark, YouTubePlay } from '@/components/Icons';
import { colors, font } from '@/theme/tokens';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppStore } from '@/store/useAppStore';
import type { RootStackParamList } from '@/navigation/types';
import type { ServiceId } from '@/types';

export default function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const signInMock = useAuthStore((s) => s.signInMock);
  const connectService = useAppStore((s) => s.connectService);

  // Mock sign-in (dummy data). Spotify *search* needs no login (Client
  // Credentials); user OAuth login is reserved for M3.5 playback (App Remote).
  const onMock = (via: ServiceId) => {
    signInMock(via);
    // keep the app store (which Settings/Map read) consistent with the chosen
    // service so it becomes the connected + default playback service.
    connectService(via);
    navigation.reset({ index: 0, routes: [{ name: 'Map' }] });
  };

  return (
    <View style={styles.root}>
      <AppBackground variant="login" />
      <DriftGlow size={520} rgb="255,126,168" opacity={0.5} position={{ left: -120, top: -60 }} duration={14000} />
      <DriftGlow size={420} rgb="124,198,255" opacity={0.5} position={{ right: -140, bottom: 60 }} duration={18000} reverse />
      <DriftGlow size={300} rgb="255,216,110" opacity={0.42} position={{ right: 40, top: 120 }} duration={22000} />
      <LinearGradient
        colors={['rgba(7,6,8,0.2)', 'rgba(7,6,8,0.65)', '#0c0a14']}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View style={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>LOCATION · MUSIC</Text>
          <Text style={styles.logo}>RE:{'\n'}MEDY</Text>
          <Text style={styles.subcopy}>거리에 음악을 흘려두고,{'\n'}누군가의 하루에 닿게.</Text>
        </View>

        <View style={{ gap: 11 }}>
          <Pressable
            onPress={() => onMock('spotify')}
            accessibilityRole="button"
            accessibilityLabel="Spotify로 계속하기"
            style={[styles.btn, { backgroundColor: colors.spotify }]}
          >
            <View style={styles.spotifyMark}>
              <View style={styles.spotifyDot} />
            </View>
            <Text style={[styles.btnLabel, { color: colors.spotifyText }]}>Spotify로 계속하기</Text>
          </Pressable>

          <Pressable onPress={() => onMock('apple')} style={[styles.btn, { backgroundColor: '#fff' }]}>
            <AppleDark size={20} />
            <Text style={[styles.btnLabel, { color: '#111' }]}>Apple Music으로 계속하기</Text>
          </Pressable>

          <Pressable
            onPress={() => onMock('youtube')}
            style={[styles.btn, { backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' }]}
          >
            <YouTubePlay size={22} />
            <Text style={[styles.btnLabel, { color: '#fff' }]}>YouTube Music으로 계속하기</Text>
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>또는</Text>
            <View style={styles.divider} />
          </View>

          <Pressable onPress={() => onMock('spotify')} style={{ alignItems: 'center' }}>
            <Text style={styles.emailLink}>이메일로 가입 / 로그인</Text>
          </Pressable>

          <Text style={styles.terms}>계속 진행하면 이용약관과 개인정보 처리방침에{'\n'}동의하는 것으로 간주됩니다.</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgLogin },
  content: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: 34, paddingBottom: 46 },
  hero: { flex: 1, justifyContent: 'center' },
  kicker: { fontFamily: font.serif, fontSize: 13, letterSpacing: 8, color: 'rgba(255,255,255,0.5)', marginBottom: 18 },
  logo: { fontFamily: font.serifBold, fontSize: 58, lineHeight: 56, color: '#fff', letterSpacing: -1 },
  subcopy: { fontFamily: font.regular, fontSize: 16, lineHeight: 26, color: 'rgba(255,255,255,0.62)', maxWidth: 240, marginTop: 22 },
  btn: { flexDirection: 'row', alignItems: 'center', gap: 12, height: 56, paddingHorizontal: 22, borderRadius: 16 },
  btnLabel: { fontFamily: font.bold, fontSize: 15.5 },
  spotifyMark: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  spotifyDot: { width: 11, height: 11, borderRadius: 5.5, backgroundColor: '#1db954' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginVertical: 8 },
  divider: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.12)' },
  dividerText: { fontFamily: font.regular, fontSize: 12, color: 'rgba(255,255,255,0.35)' },
  emailLink: { fontFamily: font.regular, fontSize: 14, color: 'rgba(255,255,255,0.78)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.3)', paddingBottom: 2 },
  terms: { fontFamily: font.regular, textAlign: 'center', marginTop: 14, fontSize: 11, lineHeight: 18, color: 'rgba(255,255,255,0.3)' },
});
