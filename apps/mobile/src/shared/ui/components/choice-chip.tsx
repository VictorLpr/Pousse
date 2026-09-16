import { Pressable, StyleSheet, Text } from 'react-native';

import { SketchShape } from '@/shared/ui/components/sketch-shape';
import { colors, fonts } from '@/shared/ui/theme';

interface ChoiceChipProps {
  label: string;
  selected: boolean;
  onPress(): void;
  accessibilityLabel?: string;
}

/** Choix « souligné » : pas de boîte, un trait corail tracé à la main marque la sélection. */
export function ChoiceChip({ label, selected, onPress, accessibilityLabel }: ChoiceChipProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={styles.chip}
    >
      {selected ? (
        <SketchShape shape="underline" stroke={colors.coral} strokeWidth={3} roughness={1.6} />
      ) : null}
      <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.inkSoft,
  },
  selectedLabel: {
    fontFamily: fonts.bodyBold,
    color: colors.ink,
  },
});
