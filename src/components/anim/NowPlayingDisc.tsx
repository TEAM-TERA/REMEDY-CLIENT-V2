/**
 * NowPlayingDisc — map right-side mini player. A rotating disc (cover + gradient
 * ring approximating the prototype's conic border) with a center spindle, plus a
 * still play/pause toggle. Tapping the disc opens the full player.
 */
import React, { useEffect } from 'react';
import { Pressable, View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { SongCover } from '@/components/SongCover';
import { Pause, Play } from '@/components/Icons';
import type { CoverPalette } from '@/theme/covers';

interface Props {
  songId?: string;
  colors?: CoverPalette;
  artworkUrl?: string;
  playing: boolean;
  onPressDisc: () => void;
  onPressToggle: () => void;
  duration?: number;
}

export function NowPlayingDisc({
  songId,
  colors,
  artworkUrl,
  playing,
  onPressDisc,
  onPressToggle,
  duration = 9000,
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

  const discWrap: ViewStyle = {
    position: 'absolute',
    top: 0,
    left: 2,
    width: 62,
    height: 62,
    borderRadius: 31,
    boxShadow: '0 12px 28px -6px rgba(0,0,0,0.6), 0 0 22px -6px rgba(255,158,196,0.5)',
  } as ViewStyle;

  return (
    <View style={{ width: 66, height: 80 }}>
      <Pressable onPress={onPressDisc} style={discWrap}>
        <Animated.View style={[{ width: 62, height: 62 }, spin]}>
          {/* gradient ring (conic approximation) */}
          <LinearGradient
            colors={['#ff9ec4', '#ffd86e', '#7cc6ff', '#ff9ec4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ width: 62, height: 62, borderRadius: 31, padding: 3 }}
          >
            <SongCover songId={songId} colors={colors} artworkUrl={artworkUrl} size={56} radius={28} innerBorder={false} />
          </LinearGradient>
        </Animated.View>
        {/* center spindle */}
        <View
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 14,
            height: 14,
            marginLeft: -7,
            marginTop: -7,
            borderRadius: 7,
            backgroundColor: '#181222',
            borderWidth: 1.5,
            borderColor: 'rgba(255,255,255,0.28)',
          }}
        />
      </Pressable>

      <Pressable
        onPress={onPressToggle}
        style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          marginLeft: -16,
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: 'rgba(20,15,28,0.95)',
          borderWidth: 2,
          borderColor: '#100e1a',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 5px 12px rgba(0,0,0,0.55)',
        }}
      >
        {playing ? <Pause size={12} color="#ff9ec4" /> : <Play size={13} color="#ff9ec4" />}
      </Pressable>
    </View>
  );
}
