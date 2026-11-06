import { Redirect, useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/shared/ui/components/app-button';
import { ScreenContainer } from '@/shared/ui/components/screen-container';
import { StreakBadge } from '@/modules/journal/ui/components/streak-badge';
import { streakLabel } from '@/modules/journal/ui/format/streak';
import { useActiveChild } from '@/modules/auth/ui/state/active-child-context';
import { useEveningStreak } from '@/modules/journal/ui/hooks/use-evening-streak';
import { colors, fonts } from '@/shared/ui/theme';

export function RitualDoneScreen() {
  const router = useRouter();
  const { activeChild, isLoading } = useActiveChild();
  const streak = streakLabel(useEveningStreak(activeChild?.id));

  if (isLoading) {
    return <ScreenContainer scrollable={false}>{null}</ScreenContainer>;
  }
  if (!activeChild) {
    return <Redirect href="/" />;
  }

  return (
    <ScreenContainer
      scrollable={false}
      backgroundColor={colors.coral}
      contentStyle={styles.content}
    >
      <View style={styles.celebration}>
        <View style={styles.checkCircle}>
          <Check size={52} color={colors.ink} strokeWidth={2} />
        </View>
        <View style={styles.titles}>
          <Text accessibilityRole="header" style={styles.title}>
            Bravo {activeChild.firstName} !
          </Text>
          <Text style={styles.subtitle}>Votre moment est gardé dans le journal.</Text>
        </View>
        {streak && <StreakBadge label={streak} />}
        <Text style={styles.farewell}>On se retrouve demain soir.</Text>
      </View>
      <AppButton
        label="Revenir à l'accueil"
        variant="cream"
        onPress={() => router.dismissTo('/home')}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: 'space-between',
    paddingTop: 40,
  },
  celebration: {
    alignItems: 'center',
    gap: 22,
    marginTop: 40,
  },
  checkCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titles: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 42,
    lineHeight: 42,
    color: colors.ink,
  },
  subtitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.ink,
  },
  farewell: {
    maxWidth: 240,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    color: colors.ink,
    opacity: 0.85,
  },
});
