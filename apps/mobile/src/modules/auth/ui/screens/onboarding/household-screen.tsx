import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/shared/ui/components/app-button';
import { AppTextInput } from '@/shared/ui/components/app-text-input';
import { OverlineLabel } from '@/shared/ui/components/overline-label';
import { ScreenContainer } from '@/shared/ui/components/screen-container';
import { ScreenHeader } from '@/shared/ui/components/screen-header';
import { useSession } from '@/modules/auth/ui/state/session-context';
import { colors, fonts } from '@/shared/ui/theme';

export function HouseholdScreen() {
  const router = useRouter();
  const { account, createHousehold } = useSession();

  const [name, setName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!account) {
    return <Redirect href="/" />;
  }

  const canSubmit = name.trim().length > 0 && !isSubmitting;

  const submit = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await createHousehold(name);
      router.replace('/onboarding/child-profile');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Création impossible.');
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

      <OverlineLabel style={styles.fieldLabel}>Nom du foyer</OverlineLabel>
      <AppTextInput
        accessibilityLabel="Nom du foyer"
        value={name}
        onChangeText={setName}
        placeholder="Dupont"
        autoCapitalize="words"
        style={styles.inputText}
        spacing={14}
      />

      <Text style={styles.helper}>Vous ajouterez ensuite le profil de votre premier enfant.</Text>

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
