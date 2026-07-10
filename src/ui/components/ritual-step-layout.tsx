import type { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ProgressDots } from '@/ui/components/progress-dots';
import { ScreenContainer } from '@/ui/components/screen-container';
import { colors, fonts } from '@/ui/theme';

export const RITUAL_STEP_COUNT = 4;

interface RitualStepLayoutProps extends PropsWithChildren {
  step: number;
  title: string;
  subtitle: string;
}

/** Gabarit des étapes du rituel : fond sauge, points d'avancement, carte crème. */
export function RitualStepLayout({ step, title, subtitle, children }: RitualStepLayoutProps) {
  return (
    <ScreenContainer scrollable={false} backgroundColor={colors.sage}>
      <ProgressDots stepCount={RITUAL_STEP_COUNT} currentStep={step} />
      <View style={styles.card}>
        <Text accessibilityRole="header" style={styles.title}>
          {title}
        </Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        {children}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    marginTop: 22,
    backgroundColor: colors.background,
    borderRadius: 28,
    padding: 22,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 30,
    lineHeight: 32,
    textAlign: 'center',
    color: colors.ink,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    textAlign: 'center',
    color: colors.inkSoft,
    marginTop: 6,
    marginBottom: 20,
  },
});
