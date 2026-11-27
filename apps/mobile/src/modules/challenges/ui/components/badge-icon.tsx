import { Award, CalendarCheck, Crown, Flag, Flame, Moon } from 'lucide-react-native';
import type { ComponentType } from 'react';
import { View } from 'react-native';

import {
  CATEGORY_ICONS,
  type LucideIconProps,
} from '@/modules/challenges/ui/components/category-icon';
import { colors } from '@/shared/ui/theme';

/** One icon per catalog code; a badge added to the catalog later falls back to `Award`. */
const BADGE_ICONS: Readonly<Record<string, ComponentType<LucideIconProps>>> = {
  first_evening: Moon,
  three_evenings: Flame,
  seven_evenings: CalendarCheck,
  thirty_evenings: Crown,
  first_challenge: Flag,
  helping_challenge: CATEGORY_ICONS.helping,
  creativity_challenge: CATEGORY_ICONS.creativity,
  learning_challenge: CATEGORY_ICONS.learning,
  politeness_challenge: CATEGORY_ICONS.politeness,
};

interface BadgeIconProps {
  code: string;
  size?: number;
  color?: string;
}

/** A badge's illustration. Decorative: the surrounding label names the badge. */
export function BadgeIcon({ code, size = 26, color = colors.ink }: BadgeIconProps) {
  const Icon = BADGE_ICONS[code] ?? Award;
  return (
    <View aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Icon size={size} color={color} strokeWidth={1.8} />
    </View>
  );
}
