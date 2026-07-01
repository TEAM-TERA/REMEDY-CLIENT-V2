/**
 * Cross-platform text-prompt modal. RN's `Alert.prompt` is iOS-only, so playlist
 * create/rename and comment edit use this instead (works on Android too).
 */
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, font } from '@/theme/tokens';

interface Props {
  visible: boolean;
  title: string;
  placeholder?: string;
  initialValue?: string;
  confirmLabel?: string;
  maxLength?: number;
  onCancel: () => void;
  onSubmit: (value: string) => void;
}

export function PromptModal({ visible, title, placeholder, initialValue = '', confirmLabel = '확인', maxLength = 60, onCancel, onSubmit }: Props) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (visible) setValue(initialValue);
  }, [visible, initialValue]);

  const submit = () => {
    const v = value.trim();
    if (!v) return;
    onSubmit(v);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <KeyboardAvoidingView style={styles.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <TextInput
            value={value}
            onChangeText={setValue}
            placeholder={placeholder}
            placeholderTextColor="rgba(255,255,255,0.35)"
            style={styles.input}
            autoFocus
            maxLength={maxLength}
            returnKeyType="done"
            onSubmitEditing={submit}
          />
          <View style={styles.row}>
            <Pressable onPress={onCancel} style={[styles.btn, styles.cancel]}>
              <Text style={styles.cancelText}>취소</Text>
            </Pressable>
            <Pressable onPress={submit} style={[styles.btn, styles.confirm]}>
              <Text style={styles.confirmText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 36 },
  card: { width: '100%', borderRadius: 22, padding: 22, backgroundColor: '#1b1726', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  title: { fontFamily: font.serifBold, fontSize: 18, color: '#fff', marginBottom: 16 },
  input: { height: 50, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 14, color: '#fff', fontFamily: font.regular, fontSize: 15 },
  row: { flexDirection: 'row', gap: 10, marginTop: 18 },
  btn: { flex: 1, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cancel: { backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  cancelText: { fontFamily: font.bold, fontSize: 15, color: 'rgba(255,255,255,0.8)' },
  confirm: { backgroundColor: colors.pink },
  confirmText: { fontFamily: font.extrabold, fontSize: 15, color: '#2a1530' },
});
