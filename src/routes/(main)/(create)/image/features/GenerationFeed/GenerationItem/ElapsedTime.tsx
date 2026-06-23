'use client';

import { Text } from '@lobehub/ui';
import { useEffect, useRef, useState } from 'react';

import { formatElapsedDuration } from './utils';

interface ElapsedTimeProps {
  generationId: string;
  isActive: boolean;
  startAt?: Date | string | null;
}

const getSessionStorageKey = (generationId: string) => `generation_start_time_${generationId}`;

const toTimestamp = (value?: Date | string | null) => {
  if (!value) return null;

  const timestamp = value instanceof Date ? value.getTime() : new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
};

/**
 * Display elapsed time for image generation
 * - Uses sessionStorage to maintain accurate timing across page refreshes
 */
export function ElapsedTime({ generationId, isActive, startAt }: ElapsedTimeProps) {
  const [elapsedTime, setElapsedTime] = useState<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    if (!isActive) {
      // If not active, clear the timer and reset elapsed time
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }

      // Clear data from sessionStorage
      const storageKey = getSessionStorageKey(generationId);
      sessionStorage.removeItem(storageKey);
      setElapsedTime(null);
      return;
    }

    const storageKey = getSessionStorageKey(generationId);

    // Only set start time when the component mounts
    const clientStartTime = (() => {
      const explicitStartAt = toTimestamp(startAt);
      if (explicitStartAt !== null) {
        sessionStorage.setItem(storageKey, explicitStartAt.toString());
        return explicitStartAt;
      }

      const stored = sessionStorage.getItem(storageKey);
      if (stored) return Number(stored);

      const now = Date.now();
      sessionStorage.setItem(storageKey, now.toString());
      return now;
    })();

    const update = (timestamp: number) => {
      if (timestamp - lastUpdateRef.current >= 100) {
        const elapsed = Date.now() - clientStartTime;
        setElapsedTime(Math.max(0, elapsed));
        lastUpdateRef.current = timestamp;
      }
      frameRef.current = requestAnimationFrame(update);
    };

    frameRef.current = requestAnimationFrame(update);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [generationId, isActive, startAt]);

  // Format elapsed time display
  const formattedTime = elapsedTime === null ? '' : formatElapsedDuration(elapsedTime);

  return (
    <Text code fontSize={10} type={'secondary'}>
      {formattedTime}
    </Text>
  );
}
