import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { EMOTIONS } from '@/domain/entities/emotion';
import { AppButton } from '@/ui/components/app-button';
import { EmotionIcon } from '@/ui/components/emotion-icon';
import { RitualStepLayout } from '@/ui/components/ritual-step-layout';
import { useRitualDraft } from '@/ui/state/ritual-draft-context';
import { colors, fonts } from '@/ui/theme';

export function EmotionStepScreen() {
  const router = useRouter();
  const { emotionId, setEmotion } = useRitualDraft();

  return (
    <RitualStepLayout step={1} title="Comment tu te sens ?" subtitle="Choisis ton émotion du soir">
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel="Émotion du soir"
        style={styles.grid}>
        {EMOTIONS.map((emotion) => {
          const selected = emotion.id === emotionId;
          return (
            <Pressable
              key={emotion.id}
              accessibilityRole="radio"
              accessibilityLabel={`Émotion ${emotion.label}`}
              accessibilityState={{ selected }}
              onPress={() => setEmotion(emotion.id)}
              style={[styles.cell, selected && styles.selectedCell]}>
              <EmotionIcon emotionId={emotion.id} />
              <Text style={[styles.cellLabel, selected && styles.selectedCellLabel]}>
                {emotion.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.footer}>
        <AppButton
          label="Continuer"
          disabled={!emotionId}
          onPress={() => router.push('/ritual/pride')}
        />
      </View>
    </RitualStepLayout>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  cell: {
    flexBasis: '30%',
    flexGrow: 1,
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    gap: 7,
  },
  selectedCell: {
    backgroundColor: colors.peach,
    borderColor: colors.coral,
  },
  cellLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.inkSoft,
  },
  selectedCellLabel: {
    fontFamily: fonts.bodyBold,
    color: colors.ink,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 20,
  },
});
