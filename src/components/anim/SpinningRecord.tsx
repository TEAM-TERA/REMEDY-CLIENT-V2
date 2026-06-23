/**
 * SpinningRecord — the player turntable LP. Grooved vinyl (concentric rings)
 * with the song cover as the center label and a spindle hole. Rotates 16s
 * linear (rmSpin); pauses/resumes seamlessly with `playing`.
 */
import React, { useEffect, useMemo } from 'react';
import { View, type ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { SongCover } from '@/components/SongCover';
import type { CoverPalette } from '@/theme/covers';

interface Props {
  songId?: string;
  colors?: CoverPalette;
  artworkUrl?: string;
  size?: number;
  labelSize?: number;
  playing: boolean;
  duration?: number;
}

export function SpinningRecord({
  songId,
  colors,
  artworkUrl,
  size = 280,
  labelSize = 116,
  playing,
  duration = 16000,
}: Props) {
  const t = useSharedValue(0);
  useEffect(() => {
    if (playing) {
      t.value = withRepeat(withTiming(t.value + 360, { duration, easing: Easing.linear }), -1, false);
    } else {
      cancelAnimation(t);
    }
    return () => cancelAnimation(t);
  }, [playing, duration, t]);

  const spin = useAnimatedStyle(() => ({ transform: [{ rotate: `${t.value}deg` }] }));

  const r = size / 2;
  const grooves = useMemo(() => {
    const arr: number[] = [];
    for (let rr = labelSize / 2 + 6; rr < r - 1; rr += 3.6) arr.push(rr);
    return arr;
  }, [r, labelSize]);

  const discStyle: ViewStyle = {
    width: size,
    height: size,
    borderRadius: r,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#09070d',
    boxShadow:
      '0 26px 64px -14px rgba(0,0,0,0.78), inset 0 0 54px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.05)',
  } as ViewStyle;

  return (
    <View style={{ width: size, height: size }}>
      <Animated.View style={[discStyle, spin]}>
        {/* groove texture */}
        <Svg width={size} height={size} style={{ position: 'absolute' }}>
          <Circle cx={r} cy={r} r={r - 0.5} fill="#09070d" />
          {grooves.map((rr, i) => (
            <Circle
              key={i}
              cx={r}
              cy={r}
              r={rr}
              fill="none"
              stroke="#16131c"
              strokeWidth={1.5}
              strokeOpacity={0.9}
            />
          ))}
        </Svg>
        {/* center label = cover */}
        <View
          style={{
            width: labelSize,
            height: labelSize,
            borderRadius: labelSize / 2,
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow:
              '0 0 0 5px rgba(9,7,13,0.95), 0 0 0 6px rgba(255,255,255,0.08), inset 0 0 12px rgba(0,0,0,0.45)',
          }}
        >
          <SongCover
            songId={songId}
            colors={colors}
            artworkUrl={artworkUrl}
            size={labelSize}
            radius={labelSize / 2}
            innerBorder={false}
          />
          {/* spindle hole */}
          <View
            style={{
              position: 'absolute',
              width: 9,
              height: 9,
              borderRadius: 4.5,
              backgroundColor: '#0a0a0c',
              boxShadow: '0 0 0 2px rgba(255,255,255,0.18)',
            }}
          />
        </View>
      </Animated.View>
      {/* static top-left sheen */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: r,
          overflow: 'hidden',
        }}
      >
        <Svg width={size} height={size}>
          <Circle cx={size * 0.32} cy={size * 0.22} r={size * 0.4} fill="rgba(255,255,255,0.06)" />
        </Svg>
      </View>
    </View>
  );
}
