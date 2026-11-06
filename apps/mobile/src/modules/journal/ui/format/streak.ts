export type EveningStreak =
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly evenings: number }
  | { readonly status: 'failed' };

/**
 * E.g. "3 soirs de suite", "1 soir de suite", "nouveau" or "série indisponible";
 * null while the streak is loading, so nothing flickers.
 */
export function streakLabel(streak: EveningStreak): string | null {
  switch (streak.status) {
    case 'loading':
      return null;
    case 'failed':
      return 'série indisponible';
    case 'ready':
      if (streak.evenings === 0) {
        return 'nouveau';
      }
      return `${streak.evenings} soir${streak.evenings > 1 ? 's' : ''} de suite`;
  }
}
