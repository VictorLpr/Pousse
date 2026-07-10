import { Sprout } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { colors } from '@/ui/theme';

type DividerVariant = 'hairline' | 'stitched' | 'sprout';

interface DividerProps {
  /** hairline : filet fin · stitched : pointillé « couture » · sprout : ornement central. */
  variant?: DividerVariant;
  spacing?: number;
}

export function Divider({ variant = 'hairline', spacing = 0 }: DividerProps) {
  if (variant === 'sprout') {
    return (
      <View style={[styles.ornamentRow, { marginVertical: spacing }]}>
        <View style={styles.stitchedLine} />
        <Sprout size={18} color={colors.sageDeep} strokeWidth={1.8} />
        <View style={styles.stitchedLine} />
      </View>
    );
  }

  return (
    <View
      style={[
        variant === 'stitched' ? styles.stitched : styles.hairline,
        { marginVertical: spacing },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  hairline: {
    height: 1,
    backgroundColor: colors.border,
  },
  stitched: {
    height: 1,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.dashedBorder,
  },
  stitchedLine: {
    flex: 1,
    height: 1,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.dashedBorder,
  },
  ornamentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
});
