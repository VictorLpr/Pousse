import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { useServices } from '@/di/services-provider';

export type EveningStreak =
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly evenings: number }
  | { readonly status: 'failed' };

/** The child's streak, read again each time the screen gains focus. */
export function useEveningStreak(childId: string | undefined): EveningStreak {
  const services = useServices();
  const [streak, setStreak] = useState<EveningStreak>({ status: 'loading' });

  useFocusEffect(
    useCallback(() => {
      if (!childId) {
        return;
      }
      let isCurrent = true;
      services.getEveningStreak
        .execute(childId)
        .then((evenings) => isCurrent && setStreak({ status: 'ready', evenings }))
        .catch(() => isCurrent && setStreak({ status: 'failed' }));
      return () => {
        isCurrent = false;
      };
    }, [services, childId]),
  );

  return streak;
}
