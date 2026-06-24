/**
 * PinVisual — the drop pin artwork (white frame + cover + diamond stem for
 * active/nearby; small translucent square for dim/far). README §4.2.
 *
 * Cover uses the real album art (artworkUrl) when present, else the cover
 * gradient. (Inside a Google Maps <Marker> on iOS, react-native-svg doesn't
 * rasterize reliably, so the gradient fallback uses expo-linear-gradient; the
 * remote <Image> needs `onArtLoad` to re-raster the marker once it downloads.)
 */
import React from 'react';
import { Image, View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { coverFor } from '@/theme/covers';

interface Props {
  active: boolean;
  selected: boolean;
  songId: string;
  artworkUrl?: string;
  /** "r,g,b" glow accent */
  glow: string;
  /** called when the remote album image finishes loading (re-raster the marker) */
  onArtLoad?: () => void;
}

function Cover({
  songId,
  artworkUrl,
  size,
  radius,
  onArtLoad,
}: {
  songId: string;
  artworkUrl?: string;
  size: number;
  radius: number;
  onArtLoad?: () => void;
}) {
  if (artworkUrl) {
    return (
      <Image
        source={{ uri: artworkUrl }}
        onLoad={onArtLoad}
        style={{ width: size, height: size, borderRadius: radius }}
      />
    );
  }
  const [a, b, c] = coverFor(songId);
  return (
    <LinearGradient
      colors={[a, b, c]}
      locations={[0, 0.55, 1]}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 0.85, y: 1 }}
      style={{ width: size, height: size, borderRadius: radius }}
    />
  );
}

export function PinVisual({ active, selected, songId, artworkUrl, glow, onArtLoad }: Props) {
  if (!active) {
    const S = 26;
    return (
      <View
        style={{
          width: S,
          height: S,
          borderRadius: 9,
          opacity: 0.55,
          borderWidth: 1.5,
          borderColor: 'rgba(255,255,255,0.18)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
          overflow: 'hidden',
        } as ViewStyle}
      >
        <Cover songId={songId} artworkUrl={artworkUrl} size={S} radius={9} onArtLoad={onArtLoad} />
      </View>
    );
  }

  const S = selected ? 44 : 38;
  const frameShadow = selected
    ? `0 0 0 3px rgba(${glow},0.4), 0 10px 24px rgba(${glow},0.6)`
    : `0 6px 16px rgba(${glow},0.45)`;

  return (
    // explicit size: Google Maps iOS rasterizes a marker's React view at its
    // measured bounds — a content-sized (flex) wrapper can collapse to 0.
    <View style={{ width: S, height: S + 7, alignItems: 'center' }}>
      <View
        style={{
          width: S,
          height: S,
          borderRadius: 13,
          backgroundColor: '#fff',
          padding: 2.5,
          boxShadow: frameShadow,
        } as ViewStyle}
      >
        <Cover songId={songId} artworkUrl={artworkUrl} size={S - 5} radius={11} onArtLoad={onArtLoad} />
      </View>
      <View
        style={{
          width: 11,
          height: 11,
          marginTop: -5,
          borderRadius: 3,
          backgroundColor: '#fff',
          transform: [{ rotate: '45deg' }],
          boxShadow: `3px 3px 7px rgba(${glow},0.45)`,
        }}
      />
    </View>
  );
}
