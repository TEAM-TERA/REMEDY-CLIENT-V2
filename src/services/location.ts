/**
 * Location (INTEGRATION.md §3) — expo-location wrappers. Returns a default
 * Busan / 사상구 coordinate when permission is denied so the map still renders.
 */
import * as Location from 'expo-location';

export interface Coords {
  lat: number;
  lng: number;
}

/** 사상구 괘법동 fallback (matches the seed data center). */
export const DEFAULT_COORDS: Coords = { lat: 35.1601, lng: 128.9899 };

export async function requestPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

export async function getCurrentCoords(): Promise<Coords> {
  try {
    const granted = await requestPermission();
    if (!granted) return DEFAULT_COORDS;
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    return { lat: pos.coords.latitude, lng: pos.coords.longitude };
  } catch {
    return DEFAULT_COORDS;
  }
}

export function watchCoords(cb: (c: Coords) => void): Promise<Location.LocationSubscription> {
  return Location.watchPositionAsync(
    { accuracy: Location.Accuracy.Balanced, distanceInterval: 15 },
    (pos) => cb({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
  );
}

/** Reverse geocode → "사상구 괘법동" style 동 label. */
export async function reverseGeocodeLabel(c: Coords): Promise<string> {
  return (await reverseGeocodeInfo(c)).label;
}

export interface LocationInfo {
  /** 동(洞) chip label, e.g. "사상구 괘법동" */
  label: string;
  /** full address, e.g. "부산광역시 사상구 괘법동" */
  address: string;
}

const DEFAULT_INFO: LocationInfo = { label: '사상구 괘법동', address: '부산광역시 사상구 괘법동' };

/** unique, non-empty join (drops repeats so "부산 부산 사상구" → "부산 사상구") */
function joinParts(parts: Array<string | null | undefined>): string {
  const out: string[] = [];
  for (const p of parts) {
    const v = (p ?? '').trim();
    if (v && !out.includes(v)) out.push(v);
  }
  return out.join(' ');
}

/** Reverse geocode → { label (동), address (full) }. */
export async function reverseGeocodeInfo(c: Coords): Promise<LocationInfo> {
  try {
    const [p] = await Location.reverseGeocodeAsync({ latitude: c.lat, longitude: c.lng });
    if (!p) return DEFAULT_INFO;
    const gu = p.subregion ?? p.city ?? '';
    const dong = p.district ?? p.street ?? p.name ?? '';
    const label = joinParts([gu, dong]) || DEFAULT_INFO.label;
    const address = joinParts([p.region ?? p.city, p.subregion ?? p.city, p.district ?? p.street]) || DEFAULT_INFO.address;
    return { label, address };
  } catch {
    return DEFAULT_INFO;
  }
}
