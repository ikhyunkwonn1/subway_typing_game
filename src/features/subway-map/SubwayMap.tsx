import { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { LINES } from '../../data/lines';
import { useGameContext } from '../game-engine/useGameContext';
import { useMapInstance } from './useMapInstance';
import { useLinePathLayer } from './useLinePathLayer';
import { useTrainAnimation } from './useTrainAnimation';

export function SubwayMap() {
  const { state } = useGameContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const [map, setMap] = useState<maplibregl.Map | null>(null);

  const lineId = state.lineId;
  const line = lineId ? LINES[lineId] : null;
  const stations = line?.stations || [];

  // Initialize map
  const mapRef = useMapInstance(
    containerRef,
    stations[0]?.lat || 40.7128,
    stations[0]?.lng || -74.006
  );

  // Create/update marker with visible train icon
  useEffect(() => {
    if (!mapRef.current || !mapRef.current.isStyleLoaded()) return;

    // Remove old marker if exists
    if (markerRef.current) {
      markerRef.current.remove();
    }

    // Create a more visible train marker with emoji
    const el = document.createElement('div');
    el.className = 'train-marker';
    el.innerHTML = '🚆';
    el.style.width = '40px';
    el.style.height = '40px';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.fontSize = '32px';
    el.style.filter = 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.5))';
    el.style.userSelect = 'none';
    el.style.pointerEvents = 'none';

    markerRef.current = new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat([
      stations[0]?.lng || -74.006,
      stations[0]?.lat || 40.7128,
    ]);
    markerRef.current.addTo(mapRef.current);

    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    };
  }, [line, stations]);

  // Wait for map to load
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 50;

    const checkMapReady = () => {
      attempts++;
      if (mapRef.current && mapRef.current.isStyleLoaded()) {
        setMap(mapRef.current);
      } else if (attempts < maxAttempts) {
        setTimeout(checkMapReady, 100);
      }
    };
    checkMapReady();
  }, []);

  // Setup line path layers
  useLinePathLayer(
    map,
    line?.color || '#000',
    stations.map((s) => ({ lat: s.lat, lng: s.lng })),
    stations.map((s) => s.id)
  );

  // Animate train marker
  useTrainAnimation(map, markerRef.current, stations, state.currentIndex);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ minHeight: '100vh' }}
    />
  );
}
