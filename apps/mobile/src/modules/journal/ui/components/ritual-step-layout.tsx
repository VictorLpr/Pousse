import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import type { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  ritualDurationLabel,
  ritualDurationSpokenLabel,
} from '@/modules/journal/ui/format/ritual-duration';
import { ProgressDots } from '@/shared/ui/components/progress-dots';
import { ScreenContainer } from '@/shared/ui/components/screen-container';
import { colors, fonts } from '@/shared/ui/theme';

export const RITUAL_STEP_COUNT = 4;

const BACK_ICON_SIZE = 26;

interface RitualStepLayoutProps extends PropsWithChildren {
  step: number;
  title: string;
  subtitle: string;
}

/** Ritual step layout: open cream page, back button, progress dots, large title. */
export function RitualStepLayout({ step, title, subtitle, children }: RitualStepLayoutProps) {
  const router = useRouter();

  return (
    <ScreenContainer scrollable={false}>
      <View style={styles.topRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Revenir en arrière"
          // A step reloaded on web has no history: the ritual starts from home.
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/home'))}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          hitSlop={12}
        >
          <ChevronLeft size={BACK_ICON_SIZE} color={colors.ink} strokeWidth={2} />
        </Pressable>
        <View style={styles.dots}>
          <ProgressDots stepCount={RITUAL_STEP_COUNT} currentStep={step} />
        </View>
        <View style={styles.backButtonBalance} />
      </View>
      {step === 1 ? (
        <Text
          accessibilityLabel={`Environ ${ritualDurationSpokenLabel()}`}
          style={styles.duration}
        >
          Environ {ritualDurationLabel()}
        </Text>
      ) : null}
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <View style={styles.body}>{children}</View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginLeft: -6,
  },
  // Same width as the back button, so the dots stay centered on the page.
  backButtonBalance: {
    width: BACK_ICON_SIZE - 6,
  },
  pressed: {
    opacity: 0.6,
  },
  dots: {
    flex: 1,
  },
  duration: {
    fontFamily: fonts.body,
    fontSize: 13,
    textAlign: 'center',
    color: colors.inkSoft,
    marginTop: 10,
  },
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
