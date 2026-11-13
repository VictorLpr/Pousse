import { Square, SquareCheck } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/shared/ui/theme';

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange(checked: boolean): void;
  accessibilityHint?: string;
}

/** Open row: a bare square drawn in ink, the label read as the checkbox's name. */
export function Checkbox({ label, checked, onChange, accessibilityHint }: CheckboxProps) {
  const Icon = checked ? SquareCheck : Square;
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ checked }}
      onPress={() => onChange(!checked)}
      style={styles.row}
    >
      <View aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Icon size={22} color={colors.ink} strokeWidth={checked ? 2.2 : 1.8} />
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 8,
  },
  label: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink,
  },
});
