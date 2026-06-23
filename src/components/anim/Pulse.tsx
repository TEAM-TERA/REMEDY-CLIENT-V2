/**
 * Pulse (rmPulse) — expanding ring under the user-location dot.
 * keyframes: 0% scale .7 opacity .55 → 70% scale 2.4 opacity 0 → 100% opacity 0.
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
  color?: string;
  duration?: number;
}

export function Pulse({ size = 46, color = 'rgba(255,126,168,0.4)', duration = 2600 }: Props) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withRepeat(withTiming(1, { duration, easing: Easing.out(Easing.ease) }), -1, false);
    return () => cancelAnimation(p);
  }, [duration, p]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(p.value, [0, 0.7, 1], [0.7, 2.4, 2.4]) }],
    opacity: interpolate(p.value, [0, 0.7, 1], [0.55, 0, 0]),
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
    backgroundColor: color,
  };

  return <Animated.View style={[base, animatedStyle]} pointerEvents="none" />;
}
