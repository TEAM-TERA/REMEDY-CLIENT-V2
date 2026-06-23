/**
 * DriftGlow (rmDrift) — soft colored radial glow that slowly drifts. Used on
 * the login background (pink / sky / yellow). Rendered with react-native-svg
 * RadialGradient (RN has no CSS radial-gradient) + a reanimated translate loop.
 */
import React, { useEffect } from 'react';
import { type ViewStyle } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

interface Props {
  size: number;
  /** "r,g,b" */
  rgb: string;
  opacity?: number;
  position: ViewStyle; // left/top/right/bottom
  duration?: number;
  reverse?: boolean;
}

export function DriftGlow({ size, rgb, opacity = 0.5, position, duration = 16000, reverse = false }: Props) {
  const id = `glow${React.useId().replace(/:/g, '')}`;
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }), -1, true);
    return () => cancelAnimation(p);
  }, [duration, p]);

  const animatedStyle = useAnimatedStyle(() => {
    const dx = reverse ? 14 : -14;
    const dy = reverse ? -10 : 10;
    return {
      transform: [
        { translateX: interpolate(p.value, [0, 1], [0, dx]) },
        { translateY: interpolate(p.value, [0, 1], [0, dy]) },
      ],
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: 'absolute', width: size, height: size }, position, animatedStyle]}
    >
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={id} cx="0.5" cy="0.5" r="0.5">
            <Stop offset="0" stopColor={`rgb(${rgb})`} stopOpacity={opacity} />
            <Stop offset="0.65" stopColor={`rgb(${rgb})`} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${id})`} />
      </Svg>
    </Animated.View>
  );
}
