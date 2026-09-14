import { useWindowDimensions } from 'react-native';

import { TABLET_BREAKPOINT } from '@/shared/ui/theme';

/** Vrai à partir du point de rupture tablette : la sidebar devient persistante. */
export function useWideLayout(): boolean {
  const { width } = useWindowDimensions();
  return width >= TABLET_BREAKPOINT;
}
