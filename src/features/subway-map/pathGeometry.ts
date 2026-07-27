export interface Coordinate {
  lat: number;
  lng: number;
}

export function catmullRomInterpolation(
  p0: Coordinate,
  p1: Coordinate,
  p2: Coordinate,
  p3: Coordinate,
  t: number
): Coordinate {
  const t2 = t * t;
  const t3 = t2 * t;

  const v0 = (p2.lat - p0.lat) * 0.5;
  const v1 = (p3.lat - p1.lat) * 0.5;
  const latY =
    (2 * p1.lat - 2 * p2.lat + v0 + v1) * t3 +
    (-3 * p1.lat + 3 * p2.lat - 2 * v0 - v1) * t2 +
    v0 * t +
    p1.lat;

  const v0Lng = (p2.lng - p0.lng) * 0.5;
  const v1Lng = (p3.lng - p1.lng) * 0.5;
  const lngX =
    (2 * p1.lng - 2 * p2.lng + v0Lng + v1Lng) * t3 +
    (-3 * p1.lng + 3 * p2.lng - 2 * v0Lng - v1Lng) * t2 +
    v0Lng * t +
    p1.lng;

  return { lat: latY, lng: lngX };
}

export function buildSmoothPath(stations: Coordinate[]): Coordinate[] {
  if (stations.length < 2) return stations;
  if (stations.length === 2) return stations;

  const smoothPath: Coordinate[] = [];
  const segmentsPerInterval = 8;

  for (let i = 0; i < stations.length - 1; i++) {
    const p0 = stations[i === 0 ? 0 : i - 1];
    const p1 = stations[i];
    const p2 = stations[i + 1];
    const p3 = stations[i + 2 < stations.length ? i + 2 : i + 1];

    smoothPath.push(p1);

    for (let j = 1; j < segmentsPerInterval; j++) {
      const t = j / segmentsPerInterval;
      const point = catmullRomInterpolation(p0, p1, p2, p3, t);
      smoothPath.push(point);
    }
  }

  smoothPath.push(stations[stations.length - 1]);

  return smoothPath;
}

export function buildLineGeoJSON(
  stationCoords: Coordinate[]
): GeoJSON.FeatureCollection {
  const smoothPath = buildSmoothPath(stationCoords);
  const coordinates = smoothPath.map((c) => [c.lng, c.lat]);

  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates,
        },
        properties: {},
      },
    ],
  };
}

export function buildStationPointsGeoJSON(
  stationCoords: Coordinate[],
  stationIds: string[]
): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: stationCoords.map((coord, idx) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [coord.lng, coord.lat],
      },
      properties: {
        id: stationIds[idx],
        index: idx,
      },
    })),
  };
}
