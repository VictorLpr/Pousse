import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, fonts } from '@/ui/theme';

interface ChoiceChipProps {
  label: string;
  selected: boolean;
  onPress(): void;
  accessibilityLabel?: string;
}

/** Puce sélectionnable (tranche d'âge, etc.), style « bouton radio ». */
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
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  selectedChip: {
    backgroundColor: colors.coral,
    borderColor: colors.coral,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.inkSoft,
  },
  selectedLabel: {
    fontFamily: fonts.bodyBold,
    color: colors.ink,
  },
});
