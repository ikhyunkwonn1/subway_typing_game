import { useEffect, useRef } from 'react';

export function useAnimationFrame(callback: (deltaTime: number) => void, enabled: boolean = true) {
  const rafRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    const animate = (currentTime: number) => {
      const deltaTime = lastTimeRef.current ? currentTime - lastTimeRef.current : 0;
      lastTimeRef.current = currentTime;
      callback(deltaTime);
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [callback, enabled]);
}
