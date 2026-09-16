import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/shared/ui/components/app-button';
import { AppTextInput } from '@/shared/ui/components/app-text-input';
import { OverlineLabel } from '@/shared/ui/components/overline-label';
import { ScreenContainer } from '@/shared/ui/components/screen-container';
import { ScreenHeader } from '@/shared/ui/components/screen-header';
import { useSession } from '@/modules/auth/ui/state/session-context';
import { colors, fonts } from '@/shared/ui/theme';

export function LoginScreen() {
  const router = useRouter();
  const { signIn } = useSession();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !isSubmitting;

  const submit = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const household = await signIn(email, password);
      router.replace(household ? '/household' : '/onboarding/household');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Connexion impossible.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <ScreenHeader title="Bon retour !" subtitle="Retrouvez votre foyer" />

      <OverlineLabel style={styles.fieldLabel}>Email</OverlineLabel>
      <AppTextInput
        accessibilityLabel="Adresse email"
        value={email}
        onChangeText={setEmail}
        placeholder="vous@exemple.fr"
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        spacing={24}
      />

      <OverlineLabel style={styles.fieldLabel}>Mot de passe</OverlineLabel>
      <AppTextInput
        accessibilityLabel="Mot de passe"
        value={password}
        onChangeText={setPassword}
        placeholder="••••••••"
        secureTextEntry
        spacing={24}
      />

      {errorMessage ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {errorMessage}
        </Text>
      ) : null}

      <View style={styles.submit}>
        <AppButton label="Se connecter" disabled={!canSubmit} onPress={submit} />
        <AppButton
          label="Créer un compte"
          variant="ghost"
          onPress={() => router.replace('/onboarding/register')}
        />
      </View>

      <Text style={styles.demoHint}>Compte démo : parent@demo.fr · pousse123</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  fieldLabel: {
    marginBottom: 6,
  },
  error: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.error,
    marginBottom: 8,
  },
  submit: {
    marginTop: 16,
    gap: 4,
  },
  demoHint: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkSoft,
    textAlign: 'center',
    marginTop: 22,
  },
});
