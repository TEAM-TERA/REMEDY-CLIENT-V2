/**
 * GlassView — frosted glass surface for map-floating chips/buttons/dock
 * (README §3 surface/glass: rgba(22,18,32,.62) + blur(16px)). expo-blur
 * provides the backdrop blur; a translucent tint + hairline border match the
 * token. Android uses the experimental blur method.
 */
import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors } from '@/theme/tokens';

interface Props {
  intensity?: number;
  tint?: 'dark' | 'light' | 'default';
  /** override the translucent overlay color (defaults to glass token) */
  overlay?: string;
  borderColor?: string;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export function GlassView({
  intensity = 26,
  tint = 'dark',
  overlay = colors.glass,
  borderColor = colors.hairlineStrong,
  style,
  children,
}: Props) {
  return (
    <View style={[styles.clip, { borderColor }, style]}>
      <BlurView
        intensity={intensity}
        tint={tint}
        blurMethod="dimezisBlurView"
        style={StyleSheet.absoluteFill}
      />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: overlay }]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
  },
});
