export type LightMode = 'warm-gold' | 'multicolor' | 'ice-blue';

export type SnowIntensity = 'light' | 'heavy' | 'blizzard';

export type TimeOfDay = 'night' | 'day';

export type OrnamentEmblem = 'star' | 'gingerbread' | 'candy' | 'wreath' | 'stocking' | 'bell';

export interface Blessing {
  id: string;
  headline: string;
  subline: string;
  poeticNote: string;
  badge: string;
  accentFrom: string;
  accentTo: string;
  emblem: OrnamentEmblem;
}

export interface GiftBoxDef {
  id: string;
  position: [number, number, number];
  size: [number, number, number];
  rotationY: number;
  wrapColor: string;
  wrapAccent: string;
  ribbonColor: string;
  pattern: 'stripes' | 'dots' | 'plaid' | 'stars';
  glowColor: string;
  label: string;
}

export interface FireworkBurstEvent {
  id: number;
  origin: [number, number, number];
  palette: string[];
  scale: number;
}

export interface NoteEvent {
  pitch: number;
  velocity: number;
  trackId: string;
  timestamp: number;
}
