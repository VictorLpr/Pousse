import { useRouter } from 'expo-router';
import { Camera, ChevronRight } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AGE_RANGES, type AgeRange } from '@/domain/entities/child';
import { useServices } from '@/di/services-provider';
import { AppButton } from '@/ui/components/app-button';
import { Avatar } from '@/ui/components/avatar';
import { ChoiceChip } from '@/ui/components/choice-chip';
import { OverlineLabel } from '@/ui/components/overline-label';
import { ScreenContainer } from '@/ui/components/screen-container';
import { ScreenHeader } from '@/ui/components/screen-header';
import { ageRangeLabel, childInitial } from '@/ui/format/child';
import { useActiveChild } from '@/ui/state/active-child-context';
import { colors, fonts } from '@/ui/theme';

const DEFAULT_REMINDER_TIME = '20:00';

export function ChildProfileScreen() {
  const router = useRouter();
  const services = useServices();
  const { adoptChild } = useActiveChild();

  const [firstName, setFirstName] = useState('');
  const [ageRange, setAgeRange] = useState<AgeRange>('7-9');
  const [isSaving, setIsSaving] = useState(false);

  const canSubmit = firstName.trim().length > 0 && !isSaving;

  const createProfile = async () => {
    setIsSaving(true);
    try {
      const child = await services.createChildProfile.execute({
        firstName,
        ageRange,
        reminderTime: DEFAULT_REMINDER_TIME,
      });
      adoptChild(child);
      router.replace('/home');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenContainer>
      <ScreenHeader title="Pour qui ce soir ?" subtitle="On crée le profil de l'enfant" />

      <View style={styles.avatarZone}>
        <View>
          <Avatar initial={childInitial(firstName)} size={96} />
          <View style={styles.cameraBadge}>
            <Camera size={15} color={colors.ink} strokeWidth={2} />
          </View>
        </View>
      </View>

      <OverlineLabel color={colors.inkSoft} style={styles.fieldLabel}>
        Prénom
      </OverlineLabel>
      <TextInput
        accessibilityLabel="Prénom de l'enfant"
        value={firstName}
        onChangeText={setFirstName}
        placeholder="Léa"
        placeholderTextColor={colors.overline}
        autoCapitalize="words"
        style={styles.input}
      />

      <OverlineLabel color={colors.inkSoft} style={styles.fieldLabel}>
        Tranche d'âge
      </OverlineLabel>
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

      <OverlineLabel color={colors.inkSoft} style={styles.fieldLabel}>
        Notre rendez-vous du soir
      </OverlineLabel>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Rendez-vous du soir : tous les soirs à ${DEFAULT_REMINDER_TIME}`}
        accessibilityHint="Le choix de l'horaire arrive bientôt"
        style={styles.reminderRow}>
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
    marginBottom: 24,
  },
  cameraBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldLabel: {
    fontSize: 12,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
    paddingVertical: 15,
    paddingHorizontal: 16,
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: colors.ink,
    marginBottom: 20,
  },
  ageRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  reminderText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.ink,
  },
  submit: {
    marginTop: 28,
  },
});
