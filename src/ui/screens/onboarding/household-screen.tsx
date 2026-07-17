import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { AppButton } from '@/ui/components/app-button';
import { OverlineLabel } from '@/ui/components/overline-label';
import { ScreenContainer } from '@/ui/components/screen-container';
import { ScreenHeader } from '@/ui/components/screen-header';
import { useSession } from '@/ui/state/session-context';
import { colors, fonts } from '@/ui/theme';

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
      <TextInput
        accessibilityLabel="Nom du foyer"
        value={name}
        onChangeText={setName}
        placeholder="Dupont"
        placeholderTextColor={colors.overline}
        autoCapitalize="words"
        style={styles.input}
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
  input: {
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
    paddingVertical: 12,
    fontFamily: fonts.bodySemiBold,
    fontSize: 18,
    color: colors.ink,
    marginBottom: 14,
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
