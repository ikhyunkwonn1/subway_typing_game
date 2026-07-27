import { useEffect, useRef } from 'react';
import { interpolate } from 'd3-interpolate';
import maplibregl from 'maplibre-gl';
import { easeInOutCubic } from '../../shared/utils/easing';
import { useAnimationFrame } from '../../shared/hooks/useAnimationFrame';
import type { Station } from '../../data/types';

const ANIMATION_DURATION = 1200; // ms - longer for smooth visual effect

export function useTrainAnimation(
  map: maplibregl.Map | null,
  marker: maplibregl.Marker | null,
  stations: Station[],
  currentIndex: number
) {
  const animationStateRef = useRef<{
    isAnimating: boolean;
    startTime: number;
    fromStation: Station | null;
    toStation: Station | null;
  }>({
    isAnimating: false,
    startTime: 0,
    fromStation: null,
    toStation: null,
  });

  // Detect index change and start animation
  useEffect(() => {
    if (!map || !marker || !map.isStyleLoaded()) return;
    if (currentIndex < 0 || currentIndex >= stations.length) return;

    const toStation = stations[currentIndex];
    const fromStation = currentIndex > 0 ? stations[currentIndex - 1] : toStation;

    animationStateRef.current = {
      isAnimating: true,
      startTime: Date.now(),
      fromStation,
      toStation,
    };

    // Dramatic camera movement to destination
    map.flyTo(
      {
        center: [toStation.lng, toStation.lat],
        zoom: 19,
        duration: ANIMATION_DURATION,
        easing: easeInOutCubic,
      }
    );
  }, [map, marker, stations, currentIndex]);

  // Animate marker along the path with continuous updates
  useAnimationFrame(
    () => {
      if (!animationStateRef.current.isAnimating || !marker) return;

      const state = animationStateRef.current;
      const elapsed = Date.now() - state.startTime;
      const progress = Math.min(elapsed / ANIMATION_DURATION, 1);

      if (!state.fromStation || !state.toStation) return;

      // Smooth interpolation along the path
      const easeProgress = easeInOutCubic(progress);
      const interpolator = interpolate(
        [state.fromStation.lng, state.fromStation.lat],
        [state.toStation.lng, state.toStation.lat]
      );
      const [lng, lat] = interpolator(easeProgress);

      marker.setLngLat([lng, lat]);

      if (progress >= 1) {
        animationStateRef.current.isAnimating = false;
        // Ensure marker ends exactly at destination
        marker.setLngLat([state.toStation.lng, state.toStation.lat]);
      }
    },
    Boolean(map && marker && animationStateRef.current.isAnimating)
  );
}
