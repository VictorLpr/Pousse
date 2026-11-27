import { useLocalSearchParams, useRouter, type Href } from 'expo-router';

/** `from` value of a ritual step opened from the recap to fix one answer. */
export const FROM_RECAP = 'recap';

/**
 * Moves a ritual step forward. A step opened from the recap goes back to it
 * instead of pushing the next step, so the recap is never stacked twice.
 */
export function useRitualStepNavigation(next: Href): { goNext(): void } {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();

  const goNext = () => {
    if (from !== FROM_RECAP) {
      router.push(next);
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/ritual/recap');
    }
  };

  return { goNext };
}
