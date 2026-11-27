import { useRouter } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { JOURNAL_TEXT_MAX_LENGTH } from '@/modules/journal/domain/entities/journal-entry';
import { EmojiRow } from '@/modules/journal/ui/components/emoji-row';
import { RitualStepLayout } from '@/modules/journal/ui/components/ritual-step-layout';
import { textCounter } from '@/modules/journal/ui/format/text-counter';
import { useRitualDraft } from '@/modules/journal/ui/state/ritual-draft-context';
import { AppButton } from '@/shared/ui/components/app-button';
import { Divider } from '@/shared/ui/components/divider';
import { colors, fonts } from '@/shared/ui/theme';

// Questions the parent can ask the child to get started.
const WRITING_PROMPTS: readonly string[] = [
  "Qu'est-ce qui t'a fait sourire aujourd'hui ?",
  "De quoi es-tu fier ou fière aujourd'hui ?",
  "Qu'as-tu réussi aujourd'hui, même un tout petit peu ?",
  "Qui as-tu aidé aujourd'hui ?",
  "Qu'as-tu appris de nouveau aujourd'hui ?",
  'Quel moment de ta journée voudrais-tu garder ?',
];

export function PrideStepScreen() {
  const router = useRouter();
  const { text, setText } = useRitualDraft();
  const [promptIndex, setPromptIndex] = useState(0);
  const counter = textCounter(text.length);
  const prompt = WRITING_PROMPTS[promptIndex];

  const fitsInText = (emoji: string) => text.length + emoji.length <= JOURNAL_TEXT_MAX_LENGTH;
  const addEmoji = (emoji: string) => {
    if (fitsInText(emoji)) setText(text + emoji);
  };

  return (
    <RitualStepLayout step={2} title="Notre moment de fierté" subtitle="Écrivez-le ensemble">
      <View style={styles.ideaQuote}>
        <View style={styles.quoteBar} />
        <View style={styles.ideaTexts}>
          <View style={styles.ideaHeader}>
            <Sparkles size={14} color={colors.ink} fill={colors.coral} strokeWidth={1.4} />
            <Text style={styles.ideaTitle}>Une idée pour commencer</Text>
          </View>
          <Text accessibilityLiveRegion="polite" style={styles.ideaPrompt}>
            {prompt}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Une autre idée"
            accessibilityHint="Propose une autre question pour commencer"
            onPress={() => setPromptIndex((index) => (index + 1) % WRITING_PROMPTS.length)}
            style={({ pressed }) => [styles.nextIdea, pressed && styles.pressed]}
            hitSlop={8}
          >
            <Text style={styles.nextIdeaLabel}>Une autre idée</Text>
          </Pressable>
        </View>
      </View>

      <Divider variant="stitched" spacing={18} />
      <TextInput
        accessibilityLabel="Notre moment de fierté du jour"
        accessibilityHint={prompt}
        value={text}
        onChangeText={setText}
        maxLength={JOURNAL_TEXT_MAX_LENGTH}
        placeholder="Racontez votre moment…"
        placeholderTextColor={colors.overline}
        multiline
        textAlignVertical="top"
        style={styles.input}
      />
      <Text
        accessibilityLabel={counter.accessibilityLabel}
        accessibilityLiveRegion="polite"
        style={styles.counter}
      >
        {counter.display}
      </Text>
      <EmojiRow onPick={addEmoji} canAdd={fitsInText} />
      <Divider variant="stitched" spacing={18} />

      <AppButton
        label="Continuer"
        disabled={text.trim().length === 0}
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
  nextIdea: {
    alignSelf: 'flex-start',
    minHeight: 44,
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
  nextIdeaLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.inkSoft,
    textDecorationLine: 'underline',
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
  counter: {
    alignSelf: 'flex-end',
    marginTop: 6,
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkSoft,
  },
});
