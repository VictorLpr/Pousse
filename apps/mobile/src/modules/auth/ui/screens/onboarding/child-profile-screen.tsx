import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useServices } from '@/di/services-provider';
import { AppButton } from '@/shared/ui/components/app-button';
import { AppTextInput } from '@/shared/ui/components/app-text-input';
import { Avatar } from '@/shared/ui/components/avatar';
import { Checkbox } from '@/shared/ui/components/checkbox';
import { Divider } from '@/shared/ui/components/divider';
import { OverlineLabel } from '@/shared/ui/components/overline-label';
import { ScreenContainer } from '@/shared/ui/components/screen-container';
import { ScreenHeader } from '@/shared/ui/components/screen-header';
import { PRIVACY_POLICY_VERSION } from '@/modules/auth/domain/entities/consent';
import { authErrorMessage, CHILD_AGE_HINT } from '@/modules/auth/ui/format/auth-error';
import { birthDateFromParts, childInitial } from '@/modules/auth/ui/format/child';
import { guardianConsentLabel } from '@/modules/auth/ui/format/consent';
import { householdLabel } from '@/modules/auth/ui/format/household';
import { useSession } from '@/modules/auth/ui/state/session-context';
import { colors, fonts } from '@/shared/ui/theme';

const DEFAULT_REMINDER_TIME = '20:00';

export function ChildProfileScreen() {
  const router = useRouter();
  const services = useServices();
  const { account } = useSession();
  const { from } = useLocalSearchParams<{ from?: string }>();

  const [firstName, setFirstName] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [guardianAttested, setGuardianAttested] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!account) {
    return <Redirect href="/" />;
  }

  const isFilled = [firstName, birthDay, birthMonth, birthYear].every(
    (value) => value.trim().length > 0,
  );
  const canSubmit = isFilled && guardianAttested && !isSaving;

  const createProfile = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    try {
      await services.createChildProfile.execute({
        parentId: account.id,
        firstName,
        birthDate: birthDateFromParts(birthDay, birthMonth, birthYear),
        reminderTime: DEFAULT_REMINDER_TIME,
        consent: { policyVersion: PRIVACY_POLICY_VERSION, guardianAttested: true },
      });
      if (from === 'household') {
        router.back();
      } else {
        router.replace('/household');
      }
    } catch (error) {
      setErrorMessage(authErrorMessage(error, 'Création impossible.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Un nouvel enfant"
        subtitle={`On crée son profil dans ${householdLabel(account)}`}
        showBackButton={from === 'household'}
      />

      <View style={styles.avatarZone}>
        <Avatar initial={childInitial(firstName)} size={96} />
      </View>

      <OverlineLabel style={styles.fieldLabel}>Prénom</OverlineLabel>
      <AppTextInput
        accessibilityLabel="Prénom de l'enfant"
        value={firstName}
        onChangeText={setFirstName}
        placeholder="Léa"
        autoCapitalize="words"
        style={styles.inputText}
        spacing={26}
      />

      <OverlineLabel style={styles.fieldLabel}>Date de naissance</OverlineLabel>
      <View style={styles.birthDateRow}>
        <View style={styles.dayOrMonth}>
          <AppTextInput
            accessibilityLabel="Jour de naissance"
            value={birthDay}
            onChangeText={setBirthDay}
            placeholder="JJ"
            keyboardType="number-pad"
            inputMode="numeric"
            maxLength={2}
            style={styles.inputText}
          />
        </View>
        <View style={styles.dayOrMonth}>
          <AppTextInput
            accessibilityLabel="Mois de naissance"
            value={birthMonth}
            onChangeText={setBirthMonth}
            placeholder="MM"
            keyboardType="number-pad"
            inputMode="numeric"
            maxLength={2}
            style={styles.inputText}
          />
        </View>
        <View style={styles.year}>
          <AppTextInput
            accessibilityLabel="Année de naissance"
            value={birthYear}
            onChangeText={setBirthYear}
            placeholder="AAAA"
            keyboardType="number-pad"
            inputMode="numeric"
            maxLength={4}
            style={styles.inputText}
          />
        </View>
      </View>
      <Text style={styles.hint}>{CHILD_AGE_HINT}</Text>

      <Divider variant="stitched" spacing={26} />

      <OverlineLabel style={styles.fieldLabel}>Notre rendez-vous du soir</OverlineLabel>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Rendez-vous du soir : tous les soirs à ${DEFAULT_REMINDER_TIME}`}
        accessibilityHint="Le choix de l'horaire arrive bientôt"
        style={styles.reminderRow}
      >
        <Text style={styles.reminderText}>Tous les soirs · {DEFAULT_REMINDER_TIME}</Text>
        <ChevronRight size={18} color={colors.inkSoft} strokeWidth={2} />
      </Pressable>

      <Divider variant="stitched" spacing={26} />

      <Checkbox
        label={guardianConsentLabel(PRIVACY_POLICY_VERSION)}
        checked={guardianAttested}
        onChange={setGuardianAttested}
        accessibilityHint="Obligatoire pour créer le profil"
      />

      {errorMessage ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {errorMessage}
        </Text>
      ) : null}

      <View style={styles.submit}>
        <AppButton label="Créer le profil" disabled={!canSubmit} onPress={createProfile} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  avatarZone: {
    alignItems: 'center',
    marginBottom: 30,
  },
  fieldLabel: {
    marginBottom: 6,
  },
  inputText: {
    fontSize: 18,
  },
  birthDateRow: {
    flexDirection: 'row',
    gap: 16,
  },
  dayOrMonth: {
    flex: 1,
  },
  year: {
    flex: 2,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.inkSoft,
    marginTop: 6,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  reminderText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: colors.ink,
  },
  error: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.error,
    marginTop: 12,
  },
  submit: {
    marginTop: 34,
  },
});
