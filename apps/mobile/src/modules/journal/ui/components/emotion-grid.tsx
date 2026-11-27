import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { AgeRange } from '@/modules/auth';
import type { Emotion, EmotionCode } from '@/modules/journal/domain/entities/emotion';
import { EmotionIcon } from '@/modules/journal/ui/components/emotion-icon';
import { SketchShape } from '@/shared/ui/components/sketch-shape';
import { colors, fonts } from '@/shared/ui/theme';

interface EmotionGridProps {
  emotions: readonly Emotion[];
  selectedCode: EmotionCode | null;
  onSelect(code: EmotionCode): void;
  /** The active child's age range; without a child the grid keeps its regular size. */
  ageRange?: AgeRange;
}

type GridSize = 'large' | 'regular';

/** Children of 4 to 7 get bigger faces on two columns; the icon has to speak before the word. */
const GRID_SIZES: Record<
  GridSize,
  { columnBasis: `${number}%`; iconSize: number; haloSize: number; labelSize: number }
> = {
  large: { columnBasis: '50%', iconSize: 48, haloSize: 84, labelSize: 15 },
  regular: { columnBasis: '33%', iconSize: 32, haloSize: 64, labelSize: 13 },
};

/** The evening emotion picker: one radio per catalog emotion, the chosen one haloed. */
export function EmotionGrid({ emotions, selectedCode, onSelect, ageRange }: EmotionGridProps) {
  const size = GRID_SIZES[ageRange === '4-7' ? 'large' : 'regular'];

  return (
    <View accessibilityRole="radiogroup" accessibilityLabel="Émotion du soir" style={styles.grid}>
      {emotions.map((emotion) => {
        const selected = emotion.code === selectedCode;
        return (
          <Pressable
            key={emotion.code}
            accessibilityRole="radio"
            accessibilityLabel={`Émotion ${emotion.label}`}
            // react-native-web 0.21 ignores `accessibilityState`; native reads `aria-checked` too.
            aria-checked={selected}
            onPress={() => onSelect(emotion.code)}
            style={[styles.cell, { flexBasis: size.columnBasis }]}
          >
            <View style={[styles.iconHalo, { width: size.haloSize, height: size.haloSize }]}>
              {selected ? (
                <SketchShape
                  shape="circle"
                  fill={colors.peach}
                  stroke={colors.ink}
                  strokeWidth={1.6}
                />
              ) : null}
              <View>
                <EmotionIcon emotionCode={emotion.code} size={size.iconSize} />
              </View>
            </View>
            <Text
              style={[
                styles.cellLabel,
                { fontSize: size.labelSize },
                selected && styles.selectedCellLabel,
              ]}
            >
              {emotion.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 26,
  },
  cell: {
    minWidth: 64,
    minHeight: 64,
    alignItems: 'center',
    gap: 8,
  },
  iconHalo: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellLabel: {
    fontFamily: fonts.bodySemiBold,
    color: colors.inkSoft,
  },
  selectedCellLabel: {
    fontFamily: fonts.bodyBold,
    color: colors.ink,
  },
});
