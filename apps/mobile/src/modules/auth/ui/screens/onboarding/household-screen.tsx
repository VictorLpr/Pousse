import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/shared/ui/components/app-button';
import { AppTextInput } from '@/shared/ui/components/app-text-input';
import { OverlineLabel } from '@/shared/ui/components/overline-label';
import { ScreenContainer } from '@/shared/ui/components/screen-container';
import { ScreenHeader } from '@/shared/ui/components/screen-header';
import { authErrorMessage } from '@/modules/auth/ui/format/auth-error';
import { useSession } from '@/modules/auth/ui/state/session-context';
import { colors, fonts } from '@/shared/ui/theme';

/** The household is the parent and their children: naming it sets the parent's last name. */
export function HouseholdScreen() {
  const router = useRouter();
  const { account, updateLastName } = useSession();

  const [lastName, setLastName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!account) {
    return <Redirect href="/" />;
  }

  const canSubmit = lastName.trim().length > 0 && !isSubmitting;

  const submit = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await updateLastName(lastName);
      router.replace('/onboarding/child-profile');
    } catch (error) {
      setErrorMessage(authErrorMessage(error, 'Création impossible.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Votre foyer"
        subtitle="Le nid où grandiront vos souvenirs"
        showBackButton={false}
      />

      <OverlineLabel style={styles.fieldLabel}>Votre nom de famille</OverlineLabel>
      <AppTextInput
        accessibilityLabel="Votre nom de famille"
        accessibilityHint="Il donne son nom à votre foyer"
        value={lastName}
        onChangeText={setLastName}
        placeholder="Dupont"
        autoCapitalize="words"
        autoComplete="family-name"
        style={styles.inputText}
        spacing={14}
      />

      <Text style={styles.helper}>
        Il donne son nom à votre foyer, comme « Le foyer Dupont ». Vous ajouterez ensuite le profil
        de votre premier enfant.
      </Text>

      {errorMessage ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {errorMessage}
        </Text>
      ) : null}

      <View style={styles.submit}>
        <AppButton label="Créer le foyer" disabled={!canSubmit} onPress={submit} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  fieldLabel: {
    marginBottom: 6,
  },
  inputText: {
    fontSize: 18,
  },
  helper: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 21,
    color: colors.inkSoft,
  },
  error: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.error,
    marginTop: 12,
  },
  submit: {
    marginTop: 30,
  },
});
