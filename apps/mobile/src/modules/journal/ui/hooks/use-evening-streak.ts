import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { useServices } from '@/di/services-provider';
import type { EveningStreak } from '@/modules/journal/ui/format/streak';

const LOADING: EveningStreak = { status: 'loading' };

/** The child's streak, read again each time the screen gains focus. */
export function useEveningStreak(childId: string | undefined): EveningStreak {
  const services = useServices();
  const [loaded, setLoaded] = useState<{ childId: string; streak: EveningStreak } | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!childId) {
        return;
      }
      let isCurrent = true;
      const settle = (streak: EveningStreak) => isCurrent && setLoaded({ childId, streak });
      services.getEveningStreak
        .execute(childId)
        .then((evenings) => settle({ status: 'ready', evenings }))
        .catch(() => settle({ status: 'failed' }));
      return () => {
        isCurrent = false;
      };
    }, [services, childId]),
  );

  // Another child's streak is never shown while this one's loads.
  return loaded && loaded.childId === childId ? loaded.streak : LOADING;
}
