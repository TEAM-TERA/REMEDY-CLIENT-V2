/**
 * Icon set — direct ports of the prototype's inline SVGs (design HTML).
 * Stroke icons take `color` (stroke) + `strokeWidth`; fill icons take `color`.
 * viewBox is 0 0 24 24 unless noted.
 */
import React from 'react';
import Svg, { Circle, Path, Rect, G } from 'react-native-svg';

export interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

const stroke = (color = '#fff', w = 2) => ({
  fill: 'none' as const,
  stroke: color,
  strokeWidth: w,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export const LocationPin = ({ size = 16, color = '#ff8fb6', strokeWidth = 2 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path {...stroke(color, strokeWidth)} d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" />
    <Circle {...stroke(color, strokeWidth)} cx={12} cy={10} r={2.4} />
  </Svg>
);

export const Search = ({ size = 18, color = '#fff', strokeWidth = 2 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle {...stroke(color, strokeWidth)} cx={11} cy={11} r={7} />
    <Path {...stroke(color, strokeWidth)} d="M21 21l-3.6-3.6" />
  </Svg>
);

export const ChevronDown = ({ size = 13, color = 'rgba(255,255,255,0.75)', strokeWidth = 2.4 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path {...stroke(color, strokeWidth)} d="M6 9l6 6 6-6" />
  </Svg>
);

export const ChevronLeft = ({ size = 20, color = '#fff', strokeWidth = 2.2 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path {...stroke(color, strokeWidth)} d="M15 18l-6-6 6-6" />
  </Svg>
);

export const ChevronRight = ({ size = 18, color = 'rgba(255,255,255,0.4)', strokeWidth = 2 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path {...stroke(color, strokeWidth)} d="M9 18l6-6-6-6" />
  </Svg>
);

export const Recenter = ({ size = 21, color = '#ff8fb6', strokeWidth = 2 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle {...stroke(color, strokeWidth)} cx={12} cy={12} r={3.4} />
    <Path {...stroke(color, strokeWidth)} d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3" />
  </Svg>
);

export const DropMark = ({ size = 22, color = '#2a1530', strokeWidth = 2.4 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path {...stroke(color, strokeWidth)} d="M9 18V5l11-2v13" />
    <Circle {...stroke(color, strokeWidth)} cx={6} cy={18} r={3} />
    <Circle {...stroke(color, strokeWidth)} cx={17} cy={16} r={3} />
  </Svg>
);

export const Play = ({ size = 24, color = '#fff' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path fill={color} d="M7 5v14l12-7z" />
  </Svg>
);

export const Pause = ({ size = 24, color = '#fff' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect fill={color} x={6} y={5} width={4} height={14} rx={1} />
    <Rect fill={color} x={14} y={5} width={4} height={14} rx={1} />
  </Svg>
);

export const PrevTrack = ({ size = 30, color = '#fff' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path fill={color} d="M19 5v14l-9-7zM8 5v14H5V5z" />
  </Svg>
);

export const NextTrack = ({ size = 30, color = '#fff' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path fill={color} d="M5 5v14l9-7zM16 5v14h3V5z" />
  </Svg>
);

export const Shuffle = ({ size = 22, color = 'rgba(255,255,255,0.6)', strokeWidth = 2 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path {...stroke(color, strokeWidth)} d="M17 1l4 4-4 4" />
    <Path {...stroke(color, strokeWidth)} d="M3 11V9a4 4 0 0 1 4-4h14" />
    <Path {...stroke(color, strokeWidth)} d="M7 23l-4-4 4-4" />
    <Path {...stroke(color, strokeWidth)} d="M21 13v2a4 4 0 0 1-4 4H3" />
  </Svg>
);

export const ShareExternal = ({ size = 22, color = 'rgba(255,255,255,0.6)', strokeWidth = 2 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path {...stroke(color, strokeWidth)} d="M16 3h5v5" />
    <Path {...stroke(color, strokeWidth)} d="M4 20L21 3" />
    <Path {...stroke(color, strokeWidth)} d="M21 16v5h-5" />
    <Path {...stroke(color, strokeWidth)} d="M15 15l6 6" />
    <Path {...stroke(color, strokeWidth)} d="M4 4l5 5" />
  </Svg>
);

export const Heart = ({
  size = 22,
  filled = false,
  color = '#ff7ea8',
  emptyStroke = 'rgba(255,255,255,0.7)',
  strokeWidth = 2,
}: IconProps & { filled?: boolean; emptyStroke?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      fill={filled ? color : 'none'}
      stroke={filled ? color : emptyStroke}
      strokeWidth={strokeWidth}
      d="M12 21s-7-4.6-9.3-9C1 8.5 2.4 5 5.8 5 8 5 9.3 6.4 12 9c2.7-2.6 4-4 6.2-4 3.4 0 4.8 3.5 3.1 7-2.3 4.4-9.3 9-9.3 9Z"
    />
  </Svg>
);

export const Close = ({ size = 19, color = '#fff', strokeWidth = 2.2 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path {...stroke(color, strokeWidth)} d="M6 6l12 12M18 6L6 18" />
  </Svg>
);

export const Check = ({ size = 18, color = '#ff8fb6', strokeWidth = 2.5 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path {...stroke(color, strokeWidth)} d="M20 6L9 17l-5-5" />
  </Svg>
);

export const DotsVertical = ({ size = 18, color = 'rgba(255,255,255,0.35)' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle fill={color} cx={12} cy={5} r={1.6} />
    <Circle fill={color} cx={12} cy={12} r={1.6} />
    <Circle fill={color} cx={12} cy={19} r={1.6} />
  </Svg>
);

export const DotsHorizontal = ({ size = 16, color = 'rgba(255,255,255,0.35)' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle fill={color} cx={5} cy={12} r={1.6} />
    <Circle fill={color} cx={12} cy={12} r={1.6} />
    <Circle fill={color} cx={19} cy={12} r={1.6} />
  </Svg>
);

/** comment send / edit pencil */
export const SendPencil = ({ size = 18, color = '#2a1530', strokeWidth = 2 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path {...stroke(color, strokeWidth)} d="M12 20h9" />
    <Path {...stroke(color, strokeWidth)} d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </Svg>
);

export const ArrowRight = ({ size = 18, color = '#2a1530', strokeWidth = 2.6 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path {...stroke(color, strokeWidth)} d="M5 12h14" />
    <Path {...stroke(color, strokeWidth)} d="M13 6l6 6-6 6" />
  </Svg>
);

/** loop / repeat (playlist, next to 전체 재생) */
export const Repeat = ({ size = 22, color = 'rgba(255,255,255,0.6)', strokeWidth = 2 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path {...stroke(color, strokeWidth)} d="M16 3l5 5-5 5" />
    <Path {...stroke(color, strokeWidth)} d="M21 8H7a4 4 0 0 0-4 4v0a4 4 0 0 0 4 4h2" />
  </Svg>
);

// ---- brand glyphs ----------------------------------------------------------

export const SpotifyGlyph = ({ size = 26, color = '#fff' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      fill={color}
      d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm4.6 14.5a.62.62 0 0 1-.86.21c-2.35-1.44-5.3-1.76-8.79-.96a.62.62 0 1 1-.28-1.21c3.82-.87 7.09-.5 9.72 1.1a.62.62 0 0 1 .21.86zm1.23-2.74a.78.78 0 0 1-1.07.26c-2.69-1.65-6.79-2.13-9.97-1.17a.78.78 0 1 1-.45-1.49c3.63-1.1 8.15-.56 11.24 1.33a.78.78 0 0 1 .25 1.07zm.1-2.85C14.79 9.1 9.39 8.93 6.3 9.87a.93.93 0 1 1-.54-1.78c3.55-1.08 9.51-.87 13.27 1.36a.93.93 0 1 1-.95 1.6z"
    />
  </Svg>
);

export const AppleGlyph = ({ size = 22, color = '#fff' }: IconProps) => (
  <Svg width={size} height={(size * 24) / 22} viewBox="0 0 18 22">
    <Path
      fill={color}
      d="M14.5 11.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.5-.1-2.8.8-3.6.8-.7 0-1.9-.8-3.1-.8C2.8 6.4 1 8 1 11.2c0 1.6.6 3.3 1.4 4.4.7 1 1.5 2.2 2.6 2.1 1-.04 1.4-.7 2.7-.7 1.2 0 1.6.7 2.7.6 1.1-.02 1.8-1 2.5-2 .8-1.1 1.1-2.2 1.1-2.3-.02-.01-2.1-.8-2.1-3.1zm-2.4-5.7c.6-.7 1-1.7.9-2.7-.85.03-1.9.6-2.5 1.3-.5.6-1 1.6-.9 2.6 1 .07 1.9-.5 2.5-1.2z"
    />
  </Svg>
);

/** YouTube Music rounded badge (used in settings + login) */
export const YouTubeGlyph = ({ size = 28 }: { size?: number }) => (
  <Svg width={size} height={(size * 20) / 28} viewBox="0 0 28 20">
    <Rect width={28} height={20} rx={6} fill="#fff" />
    <Path d="M11 6v8l7-4-7-4z" fill="#ff0000" />
  </Svg>
);

/** Login YouTube glyph (red rounded rect + white triangle) */
export const YouTubePlay = ({ size = 22 }: { size?: number }) => (
  <Svg width={size} height={(size * 16) / 22} viewBox="0 0 22 16">
    <Rect width={22} height={16} rx={4} fill="#ff0000" />
    <Path d="M9 4.5v7l6-3.5-6-3.5Z" fill="#fff" />
  </Svg>
);

/** Login Apple glyph (dark) */
export const AppleDark = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={(size * 22) / 18} viewBox="0 0 18 22">
    <Path
      fill="#111"
      d="M14.5 11.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.5-.1-2.8.8-3.6.8-.7 0-1.9-.8-3.1-.8C2.8 6.4 1 8 1 11.2c0 1.6.6 3.3 1.4 4.4.7 1 1.5 2.2 2.6 2.1 1-.04 1.4-.7 2.7-.7 1.2 0 1.6.7 2.7.6 1.1-.02 1.8-1 2.5-2 .8-1.1 1.1-2.2 1.1-2.3-.02-.01-2.1-.8-2.1-3.1Zm-2.4-5.7c.6-.7 1-1.7.9-2.7-.85.03-1.9.6-2.5 1.3-.5.6-1 1.6-.9 2.6 1 .07 1.9-.5 2.5-1.2Z"
    />
  </Svg>
);

/** iOS status bar glyphs (cellular / wifi / battery) */
export const StatusSignal = ({ color = '#fff' }: { color?: string }) => (
  <Svg width={18} height={12} viewBox="0 0 18 12">
    <Rect fill={color} x={0} y={7} width={3} height={5} rx={1} />
    <Rect fill={color} x={5} y={4} width={3} height={8} rx={1} />
    <Rect fill={color} x={10} y={2} width={3} height={10} rx={1} />
    <Rect fill={color} x={15} y={0} width={3} height={12} rx={1} />
  </Svg>
);

export const StatusWifi = ({ color = '#fff' }: { color?: string }) => (
  <Svg width={17} height={12} viewBox="0 0 17 12">
    <Path
      fill={color}
      d="M8.5 2.5c2.3 0 4.4.9 6 2.3l1.2-1.4A11 11 0 0 0 8.5.5 11 11 0 0 0 1.3 3.4l1.2 1.4A8.9 8.9 0 0 1 8.5 2.5Zm0 3.6c1.3 0 2.6.5 3.5 1.4l1.3-1.4a7 7 0 0 0-9.6 0l1.3 1.4A5 5 0 0 1 8.5 6.1Zm0 3.5L10 11l-1.5 1.5L7 11l1.5-1.4Z"
    />
  </Svg>
);

export const StatusBattery = ({ color = '#fff' }: { color?: string }) => (
  <Svg width={26} height={13} viewBox="0 0 26 13">
    <Rect x={1} y={1} width={21} height={11} rx={3} stroke={color} strokeOpacity={0.5} fill="none" />
    <Rect x={3} y={3} width={16} height={7} rx={1.5} fill={color} />
    <Rect x={23.5} y={4.5} width={1.5} height={4} rx={0.75} fill={color} fillOpacity={0.5} />
  </Svg>
);

/** generic group re-export for screens that need raw svg primitives */
export { Svg, Path, Circle, Rect, G };
