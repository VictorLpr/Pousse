import { useRouter } from 'expo-router';
import { Sprout } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/shared/ui/components/app-button';
import { ScreenContainer } from '@/shared/ui/components/screen-container';
import { colors, fonts } from '@/shared/ui/theme';

export function WelcomeScreen() {
  const router = useRouter();

  return (
    <ScreenContainer scrollable={false} contentStyle={styles.content}>
      <View style={styles.hero}>
        <View accessible accessibilityLabel="Logo Pousse" style={styles.logoCircle}>
          <Sprout size={56} color={colors.ink} strokeWidth={1.6} />
        </View>
        <View style={styles.titles}>
          <Text accessibilityRole="header" style={styles.appName}>
            Pousse
          </Text>
          <Text style={styles.tagline}>Le moment du soir, ensemble.</Text>
        </View>
        <Text style={styles.description}>
          Chaque soir, un petit rituel partagé pour faire grandir la confiance de votre enfant.
        </Text>
      </View>

      <View style={styles.actions}>
        <AppButton
          label="Commencer"
          accessibilityHint="Crée votre compte et votre foyer"
          onPress={() => router.push('/onboarding/register')}
        />
        <AppButton
          label="J'ai déjà un compte"
          variant="ghost"
          onPress={() => router.push('/login')}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 64,
  },
  hero: {
    alignItems: 'center',
    gap: 26,
    marginTop: 26,
  },
  logoCircle: {
    width: 124,
    height: 124,
    borderRadius: 62,
    backgroundColor: colors.peach,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titles: {
    alignItems: 'center',
    gap: 10,
  },
  appName: {
    fontFamily: fonts.heading,
    fontSize: 52,
    lineHeight: 52,
    color: colors.ink,
  },
  tagline: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 18,
    color: colors.ink,
  },
  description: {
    maxWidth: 260,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 23,
    textAlign: 'center',
    color: colors.inkSoft,
  },
  actions: {
    width: '100%',
    gap: 4,
  },
});
