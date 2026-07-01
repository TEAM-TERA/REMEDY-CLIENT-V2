/**
 * RealMap (M2) — Google Maps MapView with the app's dark style, custom drop
 * markers (PinVisual), a geo-anchored "me" dot, and the two display variants
 * (0 그라데이션 오라 = translucent circles, 1 반경 링 = stroked concentric circles).
 * INTEGRATION.md §1. Replaces the M1 SVG AbstractMap on the Map screen.
 */
import React, { useEffect, useImperativeHandle, useRef, useState, forwardRef } from 'react';
import { View } from 'react-native';
import MapView, { Circle, Marker, PROVIDER_GOOGLE, type MapStyleElement, type Region } from 'react-native-maps';
import { PinVisual } from '@/components/map/PinVisual';
import { DARK_MAP_STYLE, regionFor } from '@/services/maps';
import { DEFAULT_COORDS, getCurrentCoords, type Coords } from '@/services/location';
import type { Drop } from '@/types';

export interface RealMapHandle {
  recenter: () => void;
}

interface Props {
  variant: 0 | 1;
  drops: Drop[];
  selectedDropId: string;
  glowFor: (i: number) => string;
  onSelectDrop: (id: string) => void;
  /** real album art per drop's song (Spotify); undefined → gradient cover */
  artworkFor?: (songId: string) => string | undefined;
}

/** Marker whose raster is frozen after first paint (tracksViewChanges) for
 *  performance; re-enabled on size/selection change and when the album image
 *  finishes loading. */
function DropMarker({
  drop,
  coordinate,
  selected,
  glow,
  artworkUrl,
  onPress,
}: {
  drop: Drop;
  coordinate: { latitude: number; longitude: number };
  selected: boolean;
  glow: string;
  artworkUrl?: string;
  onPress: () => void;
}) {
  const [tracks, setTracks] = useState(true);
  const offTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    setTracks(true);
    const t = setTimeout(() => setTracks(false), 1200);
    return () => clearTimeout(t);
  }, [selected, drop.songId, drop.active, artworkUrl]);

  const onArtLoad = () => {
    setTracks(true);
    if (offTimer.current) clearTimeout(offTimer.current);
    offTimer.current = setTimeout(() => setTracks(false), 350);
  };

  return (
    <Marker
      coordinate={coordinate}
      onPress={onPress}
      tracksViewChanges={tracks}
      anchor={{ x: 0.5, y: 1 }}
      zIndex={drop.active ? 10 : 6}
    >
      <PinVisual
        active={drop.active}
        selected={selected}
        songId={drop.songId}
        artworkUrl={artworkUrl}
        glow={glow}
        onArtLoad={onArtLoad}
      />
    </Marker>
  );
}

export const RealMap = forwardRef<RealMapHandle, Props>(function RealMap(
  { variant, drops, selectedDropId, glowFor, onSelectDrop, artworkFor },
  ref,
) {
  const mapRef = useRef<MapView>(null);
  const [coords, setCoords] = useState<Coords>(DEFAULT_COORDS);
  const [meTracks, setMeTracks] = useState(true);

  useEffect(() => {
    let alive = true;
    getCurrentCoords().then((c) => {
      if (!alive) return;
      setCoords(c);
      mapRef.current?.animateToRegion(regionFor(c), 600);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setMeTracks(false), 800);
    return () => clearTimeout(t);
  }, [coords]);

  useImperativeHandle(ref, () => ({
    recenter: () => mapRef.current?.animateToRegion(regionFor(coords), 500),
  }));

  const region: Region = regionFor(coords);
  const center = { latitude: coords.lat, longitude: coords.lng };

  // Real drops carry GPS from the backend (getNearbyDrops). Older mock drops
  // (lat/lng 0) fall back to the design's relative map positions around "me".
  const SPREAD = 0.9 / 111; // ~0.9km half-span in degrees
  const dropCoordinate = (d: Drop) =>
    d.lat && d.lng
      ? { latitude: d.lat, longitude: d.lng }
      : {
          latitude: coords.lat + ((50 - d.mapY) / 100) * SPREAD * 2,
          longitude: coords.lng + ((d.mapX - 50) / 100) * SPREAD * 2,
        };

  return (
    <MapView
      ref={mapRef}
      provider={PROVIDER_GOOGLE}
      style={{ flex: 1 }}
      customMapStyle={DARK_MAP_STYLE as unknown as MapStyleElement[]}
      initialRegion={region}
      showsUserLocation={false}
      showsMyLocationButton={false}
      showsCompass={false}
      toolbarEnabled={false}
      rotateEnabled={false}
      pitchEnabled={false}
    >
      {/* variant overlays */}
      {variant === 0 ? (
        <>
          <Circle center={center} radius={420} fillColor="rgba(255,143,182,0.16)" strokeColor="transparent" />
          <Circle center={center} radius={260} fillColor="rgba(124,198,255,0.12)" strokeColor="transparent" />
          <Circle center={center} radius={140} fillColor="rgba(255,216,110,0.12)" strokeColor="transparent" />
        </>
      ) : (
        <>
          <Circle center={center} radius={150} strokeColor="rgba(255,143,182,0.8)" strokeWidth={2.5} fillColor="transparent" />
          <Circle center={center} radius={320} strokeColor="rgba(255,216,110,0.55)" strokeWidth={1.8} fillColor="transparent" />
          <Circle center={center} radius={520} strokeColor="rgba(124,198,255,0.4)" strokeWidth={1.5} fillColor="transparent" />
        </>
      )}

      {/* drop markers */}
      {drops.map((d, i) => (
        <DropMarker
          key={d.id}
          drop={d}
          coordinate={dropCoordinate(d)}
          selected={d.id === selectedDropId}
          glow={glowFor(i)}
          artworkUrl={d.albumImageUrl ?? artworkFor?.(d.songId)}
          onPress={() => onSelectDrop(d.id)}
        />
      ))}

      {/* my location (geo-anchored pink dot) */}
      <Marker coordinate={center} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={meTracks} zIndex={5}>
        <View
          style={{
            width: 18,
            height: 18,
            borderRadius: 9,
            backgroundColor: '#ff7ea8',
            borderWidth: 3,
            borderColor: '#fff',
            boxShadow: '0 0 14px rgba(255,126,168,0.9)',
          }}
        />
      </Marker>
    </MapView>
  );
});
