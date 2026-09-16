import { StyleSheet, View } from 'react-native';

import { SketchShape } from '@/shared/ui/components/sketch-shape';
import { SketchSprout } from '@/shared/ui/components/sketch-sprout';
import { colors } from '@/shared/ui/theme';

type DividerVariant = 'hairline' | 'stitched' | 'sprout';

interface DividerProps {
  /** hairline : filet fin tracé à main levée · stitched : pointillé « couture » · sprout : ornement central. */
  variant?: DividerVariant;
  spacing?: number;
}

export function Divider({ variant = 'hairline', spacing = 0 }: DividerProps) {
  if (variant === 'sprout') {
    return (
      <View style={[styles.ornamentRow, { marginVertical: spacing }]}>
        <View style={styles.stitchedLine} />
        <SketchSprout size={18} color={colors.sageDeep} strokeWidth={1.8} />
        <View style={styles.stitchedLine} />
      </View>
    );
  }

  if (variant === 'stitched') {
    return <View style={[styles.stitched, { marginVertical: spacing }]} />;
  }

  return (
    <View style={[styles.hairlineWrapper, { marginVertical: spacing }]}>
      <SketchShape shape="underline" stroke={colors.border} strokeWidth={1.4} roughness={1} />
    </View>
  );
}

const styles = StyleSheet.create({
  hairlineWrapper: {
    height: 1,
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
