import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, fonts } from '@/ui/theme';

interface ChoiceChipProps {
  label: string;
  selected: boolean;
  onPress(): void;
  accessibilityLabel?: string;
}

/** Choix « souligné » : pas de boîte, un trait corail marque la sélection. */
export function ChoiceChip({ label, selected, onPress, accessibilityLabel }: ChoiceChipProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.selectedChip]}>
      <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  selectedChip: {
    borderBottomColor: colors.coral,
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
