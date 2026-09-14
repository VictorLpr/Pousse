import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { AppButton } from '@/shared/ui/components/app-button';
import { OverlineLabel } from '@/shared/ui/components/overline-label';
import { ScreenContainer } from '@/shared/ui/components/screen-container';
import { ScreenHeader } from '@/shared/ui/components/screen-header';
import { useSession } from '@/modules/auth/ui/state/session-context';
import { colors, fonts } from '@/shared/ui/theme';

export function RegisterScreen() {
  const router = useRouter();
  const { register } = useSession();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit =
    email.trim().length > 0 && password.length > 0 && confirmation.length > 0 && !isSubmitting;

  const submit = async () => {
    if (password !== confirmation) {
      setErrorMessage('Les mots de passe ne correspondent pas.');
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await register(email, password);
      router.replace('/onboarding/household');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Inscription impossible.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <ScreenHeader title="Créer votre compte" subtitle="Une adresse email et c'est parti" />

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
        accessibilityHint="Au moins 6 caractères"
        value={password}
        onChangeText={setPassword}
        placeholder="Au moins 6 caractères"
        placeholderTextColor={colors.overline}
        secureTextEntry
        style={styles.input}
      />

      <OverlineLabel style={styles.fieldLabel}>Confirmez le mot de passe</OverlineLabel>
      <TextInput
        accessibilityLabel="Confirmation du mot de passe"
        value={confirmation}
        onChangeText={setConfirmation}
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
        <AppButton label="Continuer" disabled={!canSubmit} onPress={submit} />
        <AppButton
          label="J'ai déjà un compte"
          variant="ghost"
          onPress={() => router.replace('/login')}
        />
      </View>
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
});
