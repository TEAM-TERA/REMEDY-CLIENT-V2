/**
 * AppBackground — the app's radial backdrop:
 * radial-gradient(120% 100% at 50% 0%, #241d33, #120f1d 55%, #0a0812).
 * Absolute-fills its parent. Pass `variant="login"` for the login flat base.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

export function AppBackground({ variant = 'app' }: { variant?: 'app' | 'login' }) {
  if (variant === 'login') {
    return <View style={[StyleSheet.absoluteFill, { backgroundColor: '#0c0a14' }]} />;
  }
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: '#120f1d' }]}>
      <Svg width="100%" height="100%">
        <Defs>
          <RadialGradient id="appbg" cx="0.5" cy="0" r="1.15">
            <Stop offset="0" stopColor="#241d33" />
            <Stop offset="0.55" stopColor="#120f1d" />
            <Stop offset="1" stopColor="#0a0812" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#appbg)" />
      </Svg>
    </View>
  );
}
