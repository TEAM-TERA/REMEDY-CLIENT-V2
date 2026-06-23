/**
 * SongCover — renders album art. Uses Song.artworkUrl when present, otherwise
 * the 3-layer radial-gradient fallback (README §3 "곡 커버"), reproduced with
 * react-native-svg RadialGradients.
 */
import React from 'react';
import { Image, StyleSheet, View, type ViewStyle } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { coverFor, type CoverPalette } from '@/theme/covers';

interface Props {
  songId?: string;
  colors?: CoverPalette;
  artworkUrl?: string;
  size: number;
  /** override for full-bleed non-square heroes (player/playlist) */
  height?: number;
  radius?: number;
  innerBorder?: boolean;
  style?: ViewStyle;
}

export function SongCover({
  songId,
  colors,
  artworkUrl,
  size,
  height,
  radius = 12,
  innerBorder = true,
  style,
}: Props) {
  const [a, b, c] = colors ?? coverFor(songId);
  const w = size;
  const h = height ?? size;
  // unique, stable gradient ids (survives Fast Refresh; no module-global counter)
  const id = `cv${React.useId().replace(/:/g, '')}`;

  const container: ViewStyle = {
    width: w,
    height: h,
    borderRadius: radius,
    overflow: 'hidden',
    backgroundColor: '#100e1a',
    ...(innerBorder
      ? { borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.1)' }
      : null),
    ...style,
  };

  if (artworkUrl) {
    return (
      <View style={container}>
        <Image source={{ uri: artworkUrl }} style={{ width: w, height: h }} />
      </View>
    );
  }

  return (
    <View style={container}>
      <Svg width={w} height={h}>
        <Defs>
          {/* bottom glow c → near-black base (sets the dark tone) */}
          <RadialGradient id={`${id}c`} cx="0.5" cy="1.15" r="0.95">
            <Stop offset="0" stopColor={c} stopOpacity={1} />
            <Stop offset="1" stopColor="#08060a" stopOpacity={1} />
          </RadialGradient>
          {/* mid glow b */}
          <RadialGradient id={`${id}b`} cx="0.85" cy="0.22" r="0.9">
            <Stop offset="0" stopColor={b} stopOpacity={0.95} />
            <Stop offset="0.6" stopColor={b} stopOpacity={0} />
          </RadialGradient>
          {/* top glow a */}
          <RadialGradient id={`${id}a`} cx="0.25" cy="0.12" r="0.85">
            <Stop offset="0" stopColor={a} stopOpacity={1} />
            <Stop offset="0.55" stopColor={a} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width={w} height={h} fill={`url(#${id}c)`} />
        <Rect x={0} y={0} width={w} height={h} fill={`url(#${id}b)`} />
        <Rect x={0} y={0} width={w} height={h} fill={`url(#${id}a)`} />
      </Svg>
    </View>
  );
}
