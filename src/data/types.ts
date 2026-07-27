export interface Station {
  id: string;
  name: string;
  aliases?: string[];
  lat: number;
  lng: number;
}

export interface LineData {
  id: 'L' | '1' | 'W';
  displayName: string;
  color: string;
  stations: Station[];
}

export type LineId = 'L' | '1' | 'W';
