import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { Camera, ChevronRight } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AGE_RANGES, type AgeRange } from '@/domain/entities/child';
import { useServices } from '@/di/services-provider';
import { AppButton } from '@/ui/components/app-button';
import { Avatar } from '@/ui/components/avatar';
import { ChoiceChip } from '@/ui/components/choice-chip';
import { Divider } from '@/ui/components/divider';
import { OverlineLabel } from '@/ui/components/overline-label';
import { ScreenContainer } from '@/ui/components/screen-container';
import { ScreenHeader } from '@/ui/components/screen-header';
import { ageRangeLabel, childInitial } from '@/ui/format/child';
import { useSession } from '@/ui/state/session-context';
import { colors, fonts } from '@/ui/theme';

const DEFAULT_REMINDER_TIME = '20:00';

export function ChildProfileScreen() {
  const router = useRouter();
  const services = useServices();
  const { household } = useSession();
  const { from } = useLocalSearchParams<{ from?: string }>();

  const [firstName, setFirstName] = useState('');
  const [ageRange, setAgeRange] = useState<AgeRange>('7-9');
  const [isSaving, setIsSaving] = useState(false);

  if (!household) {
    return <Redirect href="/" />;
  }

  const canSubmit = firstName.trim().length > 0 && !isSaving;

  const createProfile = async () => {
    setIsSaving(true);
    try {
      await services.createChildProfile.execute({
        householdId: household.id,
        firstName,
        ageRange,
        reminderTime: DEFAULT_REMINDER_TIME,
      });
      if (from === 'foyer') {
        router.back();
      } else {
        router.replace('/household');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Un nouvel enfant"
        subtitle={`On crée son profil dans le foyer ${household.name}`}
        showBackButton={from === 'foyer'}
      />

      <View style={styles.avatarZone}>
        <View>
          <Avatar initial={childInitial(firstName)} size={96} />
          <View style={styles.cameraBadge}>
            <Camera size={15} color={colors.ink} strokeWidth={2} />
          </View>
        </View>
      </View>

      <OverlineLabel style={styles.fieldLabel}>Prénom</OverlineLabel>
      <TextInput
        accessibilityLabel="Prénom de l'enfant"
        value={firstName}
        onChangeText={setFirstName}
        placeholder="Léa"
        placeholderTextColor={colors.overline}
        autoCapitalize="words"
        style={styles.input}
      />

      <OverlineLabel style={styles.fieldLabel}>Tranche d'âge</OverlineLabel>
      <View accessibilityRole="radiogroup" accessibilityLabel="Tranche d'âge" style={styles.ageRow}>
        {AGE_RANGES.map((range) => (
          <ChoiceChip
            key={range}
            label={ageRangeLabel(range)}
            accessibilityLabel={`Tranche d'âge ${ageRangeLabel(range)} ans`}
            selected={ageRange === range}
            onPress={() => setAgeRange(range)}
          />
        ))}
      </View>

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
  cameraBadge: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
    marginBottom: 26,
  },
  ageRow: {
    flexDirection: 'row',
    gap: 8,
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
  submit: {
    marginTop: 34,
  },
});
