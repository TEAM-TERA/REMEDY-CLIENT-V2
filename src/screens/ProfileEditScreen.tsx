/**
 * Profile edit — PATCH /users (username / gender / birthDate). Pre-filled from
 * the session profile; on save it updates the backend and refreshes the session.
 */
import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChevronLeft } from '@/components/Icons';
import { colors, font } from '@/theme/tokens';
import { updateProfile } from '@/services/backend';
import { useAuthStore } from '@/store/useAuthStore';
import { ApiError } from '@/services/api';
import type { RootStackParamList } from '@/navigation/types';

function validBirth(s: string): boolean {
  return s === '' || /^\d{4}-\d{2}-\d{2}$/.test(s);
}

export default function ProfileEditScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);

  const [username, setUsername] = useState(user?.username ?? '');
  const [birthDate, setBirthDate] = useState(user?.birthDate ?? '');
  const [gender, setGender] = useState<boolean | null>(user?.gender ?? null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const onSave = async () => {
    setError('');
    if (!username.trim()) return setError('닉네임을 입력해주세요.');
    if (!validBirth(birthDate)) return setError('생년월일을 YYYY-MM-DD 형식으로 입력해주세요.');
    setBusy(true);
    try {
      await updateProfile({
        username: username.trim(),
        gender: gender ?? undefined,
        birthDate: birthDate || undefined,
      });
      await refreshProfile();
      navigation.goBack();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : '저장에 실패했어요.');
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
        <Text style={styles.title}>프로필 편집</Text>
        <View style={{ width: 42 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={{ gap: 18 }}>
          <View style={{ gap: 8 }}>
            <Text style={styles.label}>닉네임</Text>
            <TextInput value={username} onChangeText={setUsername} placeholder="닉네임" placeholderTextColor="rgba(255,255,255,0.35)" style={styles.input} autoCapitalize="none" />
          </View>

          <View style={{ gap: 8 }}>
            <Text style={styles.label}>이메일</Text>
            <View style={[styles.input, styles.readonly]}>
              <Text style={styles.readonlyText}>{user?.email || '—'}</Text>
            </View>
            <Text style={styles.help}>이메일은 변경할 수 없어요.</Text>
          </View>

          <View style={{ gap: 8 }}>
            <Text style={styles.label}>생년월일</Text>
            <TextInput value={birthDate} onChangeText={setBirthDate} placeholder="YYYY-MM-DD" placeholderTextColor="rgba(255,255,255,0.35)" style={styles.input} keyboardType="numbers-and-punctuation" maxLength={10} />
          </View>

          <View style={{ gap: 8 }}>
            <Text style={styles.label}>성별</Text>
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
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable onPress={onSave} disabled={busy} style={[styles.cta, busy && { opacity: 0.7 }]}>
            {busy ? <ActivityIndicator color="#2a1530" /> : <Text style={styles.ctaText}>저장</Text>}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgBase },
  header: { paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: font.serifBold, fontSize: 18, color: '#fff' },
  scroll: { paddingHorizontal: 26, paddingTop: 24, paddingBottom: 50 },
  label: { fontFamily: font.semibold, fontSize: 13, color: 'rgba(255,255,255,0.6)' },
  input: { height: 52, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 16, color: '#fff', fontFamily: font.regular, fontSize: 15, justifyContent: 'center' },
  readonly: { backgroundColor: 'rgba(255,255,255,0.02)' },
  readonlyText: { color: 'rgba(255,255,255,0.5)', fontFamily: font.regular, fontSize: 15 },
  help: { fontFamily: font.regular, fontSize: 12, color: 'rgba(255,255,255,0.35)' },
  genderRow: { flexDirection: 'row', gap: 10 },
  genderBtn: { flex: 1, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  genderBtnOn: { backgroundColor: 'rgba(255,143,182,0.14)', borderColor: 'rgba(255,143,182,0.5)' },
  genderText: { fontFamily: font.semibold, fontSize: 15, color: 'rgba(255,255,255,0.6)' },
  genderTextOn: { color: colors.pink },
  error: { fontFamily: font.regular, fontSize: 13, color: '#ff9cbb' },
  cta: { height: 56, borderRadius: 16, backgroundColor: colors.pink, alignItems: 'center', justifyContent: 'center', marginTop: 6, boxShadow: '0 12px 28px -8px rgba(255,143,182,0.6)' },
  ctaText: { fontFamily: font.extrabold, fontSize: 16, color: '#2a1530' },
});
