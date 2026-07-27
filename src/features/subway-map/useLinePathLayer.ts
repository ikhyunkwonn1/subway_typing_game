import { useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import { buildLineGeoJSON, buildStationPointsGeoJSON } from './pathGeometry';
import type { Coordinate } from './pathGeometry';

export function useLinePathLayer(
  map: maplibregl.Map | null,
  lineColor: string,
  stationCoords: Coordinate[],
  stationIds: string[]
) {
  useEffect(() => {
    if (!map || !map.isStyleLoaded()) return;

    const lineGeoJSON = buildLineGeoJSON(stationCoords);
    const stationGeoJSON = buildStationPointsGeoJSON(stationCoords, stationIds);

    // Add line source and layer
    if (!map.getSource('line-path')) {
      map.addSource('line-path', {
        type: 'geojson',
        data: lineGeoJSON,
      });
    } else {
      (map.getSource('line-path') as maplibregl.GeoJSONSource).setData(lineGeoJSON);
    }

    if (!map.getLayer('line-path-layer')) {
      map.addLayer({
        id: 'line-path-layer',
        type: 'line',
        source: 'line-path',
        paint: {
          'line-color': lineColor,
          'line-width': 3,
          'line-opacity': 0.9,
        },
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
      });
    } else {
      map.setPaintProperty('line-path-layer', 'line-color', lineColor);
    }

    // Add station points
    if (!map.getSource('stations')) {
      map.addSource('stations', {
        type: 'geojson',
        data: stationGeoJSON,
      });
    } else {
      (map.getSource('stations') as maplibregl.GeoJSONSource).setData(stationGeoJSON);
    }

    if (!map.getLayer('stations-layer')) {
      map.addLayer({
        id: 'stations-layer',
        type: 'circle',
        source: 'stations',
        paint: {
          'circle-radius': 5,
          'circle-color': lineColor,
          'circle-opacity': 0.6,
        },
      });
    }
  }, [map, lineColor, stationCoords, stationIds]);
}
