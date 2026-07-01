/**
 * Email auth — real register/login against REMEDY-BACK-V3 (auth/register,
 * auth/login). On success the JWT is persisted (api.setToken) and the session
 * profile is loaded, then we reset to Map.
 *
 * Register fields map to SignupDto: username, email, password, birthDate
 * (YYYY-MM-DD), gender (boolean — 남성=true / 여성=false).
 */
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChevronLeft } from '@/components/Icons';
import { colors, font } from '@/theme/tokens';
import { useAuthStore } from '@/store/useAuthStore';
import { ApiError } from '@/services/api';
import type { RootStackParamList } from '@/navigation/types';

type Mode = 'login' | 'register';

function validBirth(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

export default function AuthScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Auth'>>();
  const insets = useSafeAreaInsets();
  const signIn = useAuthStore((s) => s.signIn);
  const register = useAuthStore((s) => s.register);

  const [mode, setMode] = useState<Mode>(route.params?.mode ?? 'login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const isRegister = mode === 'register';

  const onSubmit = async () => {
    setError('');
    if (!email.trim() || !password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }
    if (isRegister) {
      if (!username.trim()) return setError('닉네임을 입력해주세요.');
      if (!validBirth(birthDate)) return setError('생년월일을 YYYY-MM-DD 형식으로 입력해주세요.');
      if (gender === null) return setError('성별을 선택해주세요.');
    }
    setBusy(true);
    try {
      if (isRegister) {
        await register({ username: username.trim(), email: email.trim(), password, birthDate, gender: gender! });
      }
      await signIn(email.trim(), password);
      navigation.reset({ index: 0, routes: [{ name: 'Map' }] });
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.status === 401) setError('이메일 또는 비밀번호가 올바르지 않아요.');
        else if (e.status === 409) setError('이미 가입된 이메일이에요.');
        else setError(e.message);
      } else {
        setError('문제가 발생했어요. 다시 시도해주세요.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.iconBtn} accessibilityLabel="뒤로">
          <ChevronLeft size={20} color="#fff" strokeWidth={2.2} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>RE:MEDY</Text>
        <Text style={styles.title}>{isRegister ? '계정 만들기' : '다시 만나서 반가워요'}</Text>
        <Text style={styles.sub}>{isRegister ? '몇 가지만 알려주면 바로 시작할 수 있어요.' : '이메일로 로그인하고 음악을 이어가요.'}</Text>

        <View style={styles.form}>
          {isRegister && (
            <Field label="닉네임">
              <TextInput value={username} onChangeText={setUsername} placeholder="지도에 표시될 이름" placeholderTextColor="rgba(255,255,255,0.35)" style={styles.input} autoCapitalize="none" />
            </Field>
          )}
          <Field label="이메일">
            <TextInput value={email} onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor="rgba(255,255,255,0.35)" style={styles.input} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" />
          </Field>
          <Field label="비밀번호">
            <TextInput value={password} onChangeText={setPassword} placeholder="비밀번호" placeholderTextColor="rgba(255,255,255,0.35)" style={styles.input} secureTextEntry autoCapitalize="none" />
          </Field>

          {isRegister && (
            <>
              <Field label="생년월일">
                <TextInput value={birthDate} onChangeText={setBirthDate} placeholder="YYYY-MM-DD" placeholderTextColor="rgba(255,255,255,0.35)" style={styles.input} keyboardType="numbers-and-punctuation" maxLength={10} />
              </Field>
              <Field label="성별">
                <View style={styles.genderRow}>
                  {[
                    { label: '여성', value: false },
                    { label: '남성', value: true },
                  ].map((g) => {
                    const on = gender === g.value;
                    return (
                      <Pressable key={g.label} onPress={() => setGender(g.value)} style={[styles.genderBtn, on && styles.genderBtnOn]}>
                        <Text style={[styles.genderText, on && styles.genderTextOn]}>{g.label}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </Field>
            </>
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable onPress={onSubmit} disabled={busy} style={[styles.cta, busy && { opacity: 0.7 }]}>
            {busy ? <ActivityIndicator color="#2a1530" /> : <Text style={styles.ctaText}>{isRegister ? '가입하고 시작하기' : '로그인'}</Text>}
          </Pressable>

          <Pressable onPress={() => { setError(''); setMode(isRegister ? 'login' : 'register'); }} style={{ alignItems: 'center', paddingVertical: 6 }}>
            <Text style={styles.switch}>
              {isRegister ? '이미 계정이 있나요? 로그인' : '처음이신가요? 계정 만들기'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgBase },
  header: { paddingHorizontal: 20 },
  iconBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingHorizontal: 26, paddingTop: 14, paddingBottom: 50 },
  kicker: { fontFamily: font.serif, fontSize: 13, letterSpacing: 4, color: 'rgba(255,255,255,0.45)' },
  title: { fontFamily: font.serifBold, fontSize: 27, color: '#fff', marginTop: 10 },
  sub: { fontFamily: font.regular, fontSize: 14, lineHeight: 21, color: 'rgba(255,255,255,0.55)', marginTop: 8 },
  form: { marginTop: 28, gap: 18 },
  label: { fontFamily: font.semibold, fontSize: 13, color: 'rgba(255,255,255,0.6)' },
  input: { height: 52, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 16, color: '#fff', fontFamily: font.regular, fontSize: 15 },
  genderRow: { flexDirection: 'row', gap: 10 },
  genderBtn: { flex: 1, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  genderBtnOn: { backgroundColor: 'rgba(255,143,182,0.14)', borderColor: 'rgba(255,143,182,0.5)' },
  genderText: { fontFamily: font.semibold, fontSize: 15, color: 'rgba(255,255,255,0.6)' },
  genderTextOn: { color: colors.pink },
  error: { fontFamily: font.regular, fontSize: 13, color: '#ff9cbb', marginTop: -4 },
  cta: { height: 56, borderRadius: 16, backgroundColor: colors.pink, alignItems: 'center', justifyContent: 'center', marginTop: 8, boxShadow: '0 12px 28px -8px rgba(255,143,182,0.6)' },
  ctaText: { fontFamily: font.extrabold, fontSize: 16, color: '#2a1530' },
  switch: { fontFamily: font.semibold, fontSize: 14, color: 'rgba(255,255,255,0.7)' },
});
