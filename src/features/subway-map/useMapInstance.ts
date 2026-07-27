import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { OPENFREEAMP_STYLE_URL } from './mapStyle';

export function useMapInstance(
  containerRef: React.RefObject<HTMLDivElement>,
  initialLat: number,
  initialLng: number
) {
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: OPENFREEAMP_STYLE_URL,
      center: [initialLng, initialLat],
      zoom: 19,
      pitch: 0,
      bearing: 0,
      dragPan: false,
      doubleClickZoom: false,
      scrollZoom: true,
    });

    map.on('load', () => {
      mapRef.current = map;
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [containerRef]);

  return mapRef;
}
