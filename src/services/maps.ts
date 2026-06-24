/**
 * Google Maps helpers (INTEGRATION.md §1). M2 renders a real <MapView> with
 * provider=google + this dark style, reusing the same custom markers as the M1
 * abstract map (MapPin). react-native-maps is imported lazily in the Map screen
 * (M2) so the M1 build runs without a dev client.
 */
import type { Coords } from '@/services/location';

export interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export function regionFor(c: Coords, spanKm = 1.5): Region {
  const latDelta = spanKm / 111; // ~111km per degree lat
  return {
    latitude: c.lat,
    longitude: c.lng,
    latitudeDelta: latDelta,
    longitudeDelta: latDelta,
  };
}

/** Dark map style matching the app's #100e1a tone (customMapStyle JSON). */
export const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#100e1a' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6b6680' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#100e1a' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#2c2a3c' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#242231' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1a1826' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#2c2a3c' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0a0812' }] },
] as const;
