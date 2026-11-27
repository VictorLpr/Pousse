import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Challenge } from '@/modules/challenges/domain/entities/challenge';
import { CategoryIcon } from '@/modules/challenges/ui/components/category-icon';
import { challengeCategoryLabel } from '@/modules/challenges/ui/format/challenge-category';
import { SketchShape } from '@/shared/ui/components/sketch-shape';
import { colors, fonts } from '@/shared/ui/theme';

interface ChallengeCardProps {
  challenge: Challenge;
  selected: boolean;
  disabled: boolean;
  onPress(): void;
}

/**
 * One of the week's proposals, as a radio: the whole row is the touch target,
 * large enough for a 4-year-old's finger. The selected one gets a peach halo.
 */
export function ChallengeCard({ challenge, selected, disabled, onPress }: ChallengeCardProps) {
  const categoryLabel = challengeCategoryLabel(challenge.category);

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={`${challenge.title}, défi ${categoryLabel}`}
      accessibilityHint="Ouvre la confirmation du choix."
      accessibilityState={{ selected, disabled }}
      // react-native-web 0.21 ignores `accessibilityState`; native reads `aria-checked` too.
      aria-checked={selected}
      aria-disabled={disabled}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && !disabled && styles.pressed]}
    >
      <View style={styles.iconHalo}>
        {selected ? (
          <SketchShape shape="circle" fill={colors.peach} stroke={colors.ink} strokeWidth={1.6} />
        ) : null}
        <CategoryIcon category={challenge.category} />
      </View>
      <View style={styles.texts}>
        <Text style={styles.category}>{categoryLabel}</Text>
        <Text style={[styles.title, selected && styles.selectedTitle]}>{challenge.title}</Text>
        <Text style={styles.description}>{challenge.description}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    minHeight: 96,
    paddingVertical: 14,
  },
  pressed: {
    opacity: 0.7,
  },
  iconHalo: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: {
    flex: 1,
    gap: 4,
  },
  category: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.overline,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 28,
    lineHeight: 32,
    color: colors.inkSoft,
  },
  selectedTitle: {
    color: colors.ink,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 21,
    color: colors.inkSoft,
  },
});
