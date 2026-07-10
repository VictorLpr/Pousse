import { Redirect, useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { eveningsUntilNextTrophy } from '@/domain/entities/child';
import { AppButton } from '@/ui/components/app-button';
import { ScreenContainer } from '@/ui/components/screen-container';
import { StreakBadge } from '@/ui/components/streak-badge';
import { streakLabel } from '@/ui/format/child';
import { useActiveChild } from '@/ui/state/active-child-context';
import { colors, fonts } from '@/ui/theme';

export function RitualDoneScreen() {
  const router = useRouter();
  const { activeChild, isLoading } = useActiveChild();

  if (isLoading) {
    return <ScreenContainer scrollable={false}>{null}</ScreenContainer>;
  }
  if (!activeChild) {
    return <Redirect href="/" />;
  }

  const remainingEvenings = eveningsUntilNextTrophy(activeChild);

  return (
    <ScreenContainer scrollable={false} backgroundColor={colors.coral} contentStyle={styles.content}>
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
        <StreakBadge label={streakLabel(activeChild)} backgroundColor={colors.background} />
        <Text style={styles.nextTrophy}>
          Encore {remainingEvenings} soir{remainingEvenings > 1 ? 's' : ''} et{' '}
          {activeChild.firstName} débloque un nouveau trophée.
        </Text>
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
  nextTrophy: {
    maxWidth: 240,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    color: colors.ink,
    opacity: 0.85,
  },
});
