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
import type { RootStackParamList } from '@/navigation/types';

export default function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Email auth is the working path locally; OAuth2 (google/kakao/naver) needs
  // provider creds configured on the backend, so the social buttons route into
  // the email flow until those are set.
  const goAuth = (mode: 'login' | 'register') => navigation.navigate('Auth', { mode });

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
            onPress={() => goAuth('register')}
            accessibilityRole="button"
            accessibilityLabel="이메일로 시작하기"
            style={[styles.btn, { backgroundColor: colors.pink }]}
          >
            <Text style={[styles.btnLabel, { color: '#2a1530' }]}>이메일로 시작하기</Text>
          </Pressable>

          <Pressable
            onPress={() => goAuth('login')}
            accessibilityRole="button"
            accessibilityLabel="로그인"
            style={[styles.btn, { backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', justifyContent: 'center' }]}
          >
            <Text style={[styles.btnLabel, { color: '#fff' }]}>이미 계정이 있어요 · 로그인</Text>
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>소셜 로그인</Text>
            <View style={styles.divider} />
          </View>

          <View style={styles.socialRow}>
            <Pressable onPress={() => goAuth('login')} style={[styles.socialBtn, { backgroundColor: colors.spotify }]} accessibilityLabel="Spotify로 계속하기">
              <View style={styles.spotifyMark}><View style={styles.spotifyDot} /></View>
            </Pressable>
            <Pressable onPress={() => goAuth('login')} style={[styles.socialBtn, { backgroundColor: '#fff' }]} accessibilityLabel="Apple로 계속하기">
              <AppleDark size={20} />
            </Pressable>
            <Pressable onPress={() => goAuth('login')} style={[styles.socialBtn, { backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' }]} accessibilityLabel="YouTube로 계속하기">
              <YouTubePlay size={22} />
            </Pressable>
          </View>

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
  socialRow: { flexDirection: 'row', gap: 11, justifyContent: 'center' },
  socialBtn: { flex: 1, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  terms: { fontFamily: font.regular, textAlign: 'center', marginTop: 14, fontSize: 11, lineHeight: 18, color: 'rgba(255,255,255,0.3)' },
});
