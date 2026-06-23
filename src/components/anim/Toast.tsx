/**
 * Toast (rmFade) — drop-confirm toast: "이 거리에 음악을 떨어뜨렸어요".
 * Driven by the app store `toast` flag (auto-hides after 2.6s).
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import { Check } from '@/components/Icons';
import { font } from '@/theme/tokens';
import { useAppStore } from '@/store/useAppStore';

export function Toast() {
  const toast = useAppStore((s) => s.toast);
  if (!toast) return null;
  return (
    <View style={styles.layer} pointerEvents="none">
      <Animated.View entering={FadeInDown.duration(300)} exiting={FadeOut.duration(200)} style={styles.pill}>
        <Check size={18} color="#ff7ea8" strokeWidth={2.2} />
        <Text style={styles.text}>이 거리에 음악을 떨어뜨렸어요</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 120,
    zIndex: 100,
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 30,
    backgroundColor: 'rgba(20,16,18,0.95)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,126,168,0.4)',
    boxShadow: '0 16px 40px -10px rgba(0,0,0,0.7)',
  },
  text: {
    color: '#fff',
    fontFamily: font.semibold,
    fontSize: 14,
  },
});
