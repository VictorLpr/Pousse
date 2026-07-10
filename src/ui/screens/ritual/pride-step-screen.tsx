import { useRouter } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { AppButton } from '@/ui/components/app-button';
import { RitualStepLayout } from '@/ui/components/ritual-step-layout';
import { useRitualDraft } from '@/ui/state/ritual-draft-context';
import { colors, fonts } from '@/ui/theme';

const WRITING_PROMPT = "Qu'est-ce qui t'a fait sourire aujourd'hui ?";

export function PrideStepScreen() {
  const router = useRouter();
  const { prideText, setPrideText } = useRitualDraft();

  return (
    <RitualStepLayout step={2} title="Le moment de fierté" subtitle="Écrivez-le ensemble">
      <View style={styles.ideaCard}>
        <View style={styles.ideaHeader}>
          <Sparkles size={15} color={colors.ink} fill={colors.coral} strokeWidth={1.4} />
          <Text style={styles.ideaTitle}>Une idée pour commencer</Text>
        </View>
        <Text style={styles.ideaPrompt}>{WRITING_PROMPT}</Text>
      </View>

      <TextInput
        accessibilityLabel="Le moment de fierté du jour"
        accessibilityHint={WRITING_PROMPT}
        value={prideText}
        onChangeText={setPrideText}
        placeholder="Raconte ton moment…"
        placeholderTextColor={colors.overline}
        multiline
        textAlignVertical="top"
        style={styles.input}
      />

      <AppButton
        label="Continuer"
        disabled={prideText.trim().length === 0}
        onPress={() => router.push('/ritual/photo')}
      />
    </RitualStepLayout>
  );
}

const styles = StyleSheet.create({
  ideaCard: {
    backgroundColor: colors.sage,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 6,
    marginBottom: 14,
  },
  ideaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  ideaTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.ink,
  },
  ideaPrompt: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.inkSoft,
  },
  input: {
    flex: 1,
    minHeight: 130,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 16,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 24,
    color: colors.ink,
    marginBottom: 16,
  },
});
