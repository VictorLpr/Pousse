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

/** Gabarit des étapes du rituel : page crème ouverte, points d'avancement, grand titre. */
export function RitualStepLayout({ step, title, subtitle, children }: RitualStepLayoutProps) {
  return (
    <ScreenContainer scrollable={false}>
      <ProgressDots stepCount={RITUAL_STEP_COUNT} currentStep={step} />
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <View style={styles.body}>{children}</View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: fonts.heading,
    fontSize: 36,
    lineHeight: 40,
    textAlign: 'center',
    color: colors.ink,
    marginTop: 30,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    textAlign: 'center',
    color: colors.inkSoft,
    marginTop: 4,
    marginBottom: 28,
  },
  body: {
    flex: 1,
  },
});
