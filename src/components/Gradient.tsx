/**
 * Gradient pill helpers built on expo-linear-gradient.
 * - SignatureGradient: 135deg #ff9ec4→#ffb3cf (드랍/CTA)
 * - RainbowGradient: 90deg #ff9ec4→#ffd86e(50%)→#7cc6ff (progress/전체재생)
 */
import React from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DIAGONAL, HORIZONTAL, gradients } from '@/theme/tokens';

interface GradientProps {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export function SignatureGradient({ style, children }: GradientProps) {
  return (
    <LinearGradient
      colors={gradients.signature as unknown as [string, string]}
      start={DIAGONAL.start}
      end={DIAGONAL.end}
      style={style}
    >
      {children}
    </LinearGradient>
  );
}

export function RainbowGradient({
  style,
  children,
  locations = gradients.rainbowLocations as unknown as [number, number, number],
}: GradientProps & { locations?: [number, number, number] }) {
  return (
    <LinearGradient
      colors={gradients.rainbow as unknown as [string, string, string]}
      locations={locations}
      start={HORIZONTAL.start}
      end={HORIZONTAL.end}
      style={style}
    >
      {children}
    </LinearGradient>
  );
}

/** segment / chip active background (135deg #ff8fb6→#ffb0c8) */
export function SegmentGradient({ style, children }: GradientProps) {
  return (
    <LinearGradient
      colors={gradients.segment as unknown as [string, string]}
      start={DIAGONAL.start}
      end={DIAGONAL.end}
      style={style}
    >
      {children}
    </LinearGradient>
  );
}
