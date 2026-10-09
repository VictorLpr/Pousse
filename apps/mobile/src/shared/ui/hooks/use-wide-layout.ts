import { useWindowDimensions } from 'react-native';

import { TABLET_BREAKPOINT } from '@/shared/ui/theme';

/** True from the tablet breakpoint up: the sidebar becomes persistent. */
export function useWideLayout(): boolean {
  const { width } = useWindowDimensions();
  return width >= TABLET_BREAKPOINT;
}
