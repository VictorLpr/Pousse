import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { AppButton } from '@/ui/components/app-button';
import { OverlineLabel } from '@/ui/components/overline-label';
import { ScreenContainer } from '@/ui/components/screen-container';
import { ScreenHeader } from '@/ui/components/screen-header';
import { useSession } from '@/ui/state/session-context';
import { colors, fonts } from '@/ui/theme';

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
      <TextInput
        accessibilityLabel="Adresse email"
        value={email}
        onChangeText={setEmail}
        placeholder="vous@exemple.fr"
        placeholderTextColor={colors.overline}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        style={styles.input}
      />

      <OverlineLabel style={styles.fieldLabel}>Mot de passe</OverlineLabel>
      <TextInput
        accessibilityLabel="Mot de passe"
        value={password}
        onChangeText={setPassword}
        placeholder="••••••••"
        placeholderTextColor={colors.overline}
        secureTextEntry
        style={styles.input}
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
  input: {
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
    paddingVertical: 12,
    fontFamily: fonts.bodySemiBold,
    fontSize: 17,
    color: colors.ink,
    marginBottom: 24,
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
