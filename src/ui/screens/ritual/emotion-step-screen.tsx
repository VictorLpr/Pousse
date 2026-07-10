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
              style={styles.cell}>
              <View style={[styles.iconHalo, selected && styles.selectedHalo]}>
                <EmotionIcon emotionId={emotion.id} size={32} />
              </View>
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
    rowGap: 26,
  },
  cell: {
    flexBasis: '33%',
    alignItems: 'center',
    gap: 8,
  },
  iconHalo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedHalo: {
    backgroundColor: colors.peach,
  },
  cellLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
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
