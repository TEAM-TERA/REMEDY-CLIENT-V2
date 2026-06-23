/**
 * Avatar — gradient initials fallback (prototype avatar()). Uses avatarUrl
 * when present. `square` renders the rounded-square profile variant.
 */
import React from 'react';
import { Image, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { avatarPalette } from '@/theme/covers';
import { font } from '@/theme/tokens';

interface Props {
  name: string;
  size?: number;
  /** initials font size; defaults to size*0.4 (prototype-tuned for the "me" avatar) */
  fontSize?: number;
  square?: boolean;
  avatarUrl?: string;
  /** override the gradient (e.g. the special "me" avatar) */
  colors?: readonly [string, string, ...string[]];
  locations?: readonly [number, number, ...number[]];
  borderColor?: string;
  borderWidth?: number;
  boxShadow?: string;
  style?: ViewStyle;
}

export function Avatar({
  name,
  size = 36,
  fontSize,
  square = false,
  avatarUrl,
  colors,
  locations,
  borderColor,
  borderWidth,
  boxShadow,
  style,
}: Props) {
  const radius = square ? Math.round(size * 0.28) : size / 2;
  const initials = name.slice(0, 3).toUpperCase();
  const pal = colors ?? avatarPalette(name);

  const frame: ViewStyle = {
    width: size,
    height: size,
    borderRadius: radius,
    overflow: 'hidden',
    ...(borderColor ? { borderColor, borderWidth: borderWidth ?? 2 } : null),
    ...(boxShadow ? ({ boxShadow } as ViewStyle) : null),
    ...style,
  };

  return (
    <View style={frame}>
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={{ width: size, height: size }} />
      ) : (
        <LinearGradient
          colors={pal as [string, string, ...string[]]}
          locations={locations as [number, number, ...number[]] | undefined}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={[StyleSheet.absoluteFill, styles.center]}
        >
          <Text
            style={{
              color: '#fff',
              fontFamily: font.extrabold,
              fontSize: fontSize ?? Math.round(size * 0.4),
              letterSpacing: 0.5,
            }}
          >
            {initials}
          </Text>
        </LinearGradient>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
});
