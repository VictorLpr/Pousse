import { StyleSheet, View } from 'react-native';

import { colors } from '@/shared/ui/theme';

interface ProgressDotsProps {
  stepCount: number;
  /** Étape courante, à partir de 1. */
  currentStep: number;
}

export function ProgressDots({ stepCount, currentStep }: ProgressDotsProps) {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={`Étape ${currentStep} sur ${stepCount}`}
      style={styles.row}
    >
      {Array.from({ length: stepCount }, (_, index) => {
        const isCurrent = index + 1 === currentStep;
        return <View key={index} style={[styles.dot, isCurrent && styles.currentDot]} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 12,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.sageDeep,
  },
  currentDot: {
    width: 26,
    backgroundColor: colors.coral,
  },
});
