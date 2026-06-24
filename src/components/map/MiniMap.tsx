/**
 * MiniMap — a small, non-interactive Google map (dark style) for the drop
 * step-2 preview and the profile drop-history map. Children render on top as
 * overlays (e.g. the centered cover pin + ring). INTEGRATION.md §1.
 */
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import MapView, { PROVIDER_GOOGLE, type MapStyleElement } from 'react-native-maps';
import { DARK_MAP_STYLE, regionFor } from '@/services/maps';
import { DEFAULT_COORDS, getCurrentCoords, type Coords } from '@/services/location';

interface Props {
  coords?: Coords;
  spanKm?: number;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export function MiniMap({ coords, spanKm = 1.2, style, children }: Props) {
  const [resolved, setResolved] = useState<Coords>(coords ?? DEFAULT_COORDS);

  useEffect(() => {
    if (coords) {
      setResolved(coords);
      return;
    }
    let alive = true;
    getCurrentCoords().then((c) => alive && setResolved(c));
    return () => {
      alive = false;
    };
  }, [coords]);

  return (
    <View style={[styles.wrap, style]}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFill}
        customMapStyle={DARK_MAP_STYLE as unknown as MapStyleElement[]}
        region={regionFor(resolved, spanKm)}
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
        pointerEvents="none"
        toolbarEnabled={false}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden' },
});
