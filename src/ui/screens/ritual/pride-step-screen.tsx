import { useRouter } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { AppButton } from '@/ui/components/app-button';
import { Divider } from '@/ui/components/divider';
import { RitualStepLayout } from '@/ui/components/ritual-step-layout';
import { useRitualDraft } from '@/ui/state/ritual-draft-context';
import { colors, fonts } from '@/ui/theme';

const WRITING_PROMPT = "Qu'est-ce qui t'a fait sourire aujourd'hui ?";

export function PrideStepScreen() {
  const router = useRouter();
  const { prideText, setPrideText } = useRitualDraft();

  return (
    <RitualStepLayout step={2} title="Le moment de fierté" subtitle="Écrivez-le ensemble">
      <View style={styles.ideaQuote}>
        <View style={styles.quoteBar} />
        <View style={styles.ideaTexts}>
          <View style={styles.ideaHeader}>
            <Sparkles size={14} color={colors.ink} fill={colors.coral} strokeWidth={1.4} />
            <Text style={styles.ideaTitle}>Une idée pour commencer</Text>
          </View>
          <Text style={styles.ideaPrompt}>{WRITING_PROMPT}</Text>
        </View>
      </View>

      <Divider variant="stitched" spacing={18} />
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
      <Divider variant="stitched" spacing={18} />

      <AppButton
        label="Continuer"
        disabled={prideText.trim().length === 0}
        onPress={() => router.push('/ritual/photo')}
      />
    </RitualStepLayout>
  );
}

const styles = StyleSheet.create({
  ideaQuote: {
    flexDirection: 'row',
    gap: 12,
  },
  quoteBar: {
    width: 3,
    borderRadius: 2,
    backgroundColor: colors.coral,
  },
  ideaTexts: {
    flex: 1,
    gap: 5,
  },
  ideaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  ideaTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.overline,
  },
  ideaPrompt: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.ink,
  },
  input: {
    flex: 1,
    minHeight: 140,
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 26,
    color: colors.ink,
    paddingVertical: 4,
  },
});
