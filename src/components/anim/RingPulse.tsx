/**
 * RingPulse (rmRing) — confirm ring around a drop pin (drop step 2 minimap).
 * keyframes: 0% scale .4 opacity .6 → 100% scale 1.6 opacity 0.
 */
import React, { useEffect } from 'react';
import { type ViewStyle } from 'react-native';
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
  size?: number;
  borderColor?: string;
  borderWidth?: number;
  duration?: number;
}

export function RingPulse({
  size = 60,
  borderColor = 'rgba(255,126,168,0.6)',
  borderWidth = 2,
  duration = 2200,
}: Props) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withRepeat(withTiming(1, { duration, easing: Easing.out(Easing.ease) }), -1, false);
    return () => cancelAnimation(p);
  }, [duration, p]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(p.value, [0, 1], [0.4, 1.6]) }],
    opacity: interpolate(p.value, [0, 1], [0.6, 0]),
  }));

  const base: ViewStyle = {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: size,
    height: size,
    marginLeft: -size / 2,
    marginTop: -size / 2,
    borderRadius: size / 2,
    borderWidth,
    borderColor,
  };

  return <Animated.View style={[base, animatedStyle]} pointerEvents="none" />;
}
