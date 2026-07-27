import type { Station } from '../../data/types';

export function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function isCorrectMatch(typed: string, station: Station): boolean {
  const normalized = normalize(typed);
  if (normalized === normalize(station.name)) {
    return true;
  }
  if (station.aliases) {
    return station.aliases.some((alias) => normalized === normalize(alias));
  }
  return false;
}
