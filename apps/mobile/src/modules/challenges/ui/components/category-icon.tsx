import { HandHelping, Lightbulb, MessageCircleHeart, Palette } from 'lucide-react-native';
import type { ComponentType } from 'react';
import { View } from 'react-native';

import type { ChallengeCategory } from '@/modules/challenges/domain/entities/challenge';
import { colors } from '@/shared/ui/theme';

interface LucideIconProps {
  size?: number | string;
  color?: string;
  strokeWidth?: number;
}

const CATEGORY_ICONS: Record<ChallengeCategory, ComponentType<LucideIconProps>> = {
  helping: HandHelping,
  creativity: Palette,
  learning: Lightbulb,
  politeness: MessageCircleHeart,
};

interface CategoryIconProps {
  category: ChallengeCategory;
  size?: number;
  color?: string;
}

/**
 * The illustration of a challenge category. Decorative: the card's label
 * names the category, so the wrapper hides it from the accessibility tree.
 */
export function CategoryIcon({ category, size = 40, color = colors.ink }: CategoryIconProps) {
  const Icon = CATEGORY_ICONS[category];
  return (
    <View aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Icon size={size} color={color} strokeWidth={1.8} />
    </View>
  );
}
