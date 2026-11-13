import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/shared/ui/components/app-button';
import { EmotionIcon } from '@/modules/journal/ui/components/emotion-icon';
import { RitualStepLayout } from '@/modules/journal/ui/components/ritual-step-layout';
import { SketchShape } from '@/shared/ui/components/sketch-shape';
import { useEmotions } from '@/modules/journal/ui/hooks/use-emotions';
import { useRitualDraft } from '@/modules/journal/ui/state/ritual-draft-context';
import { colors, fonts } from '@/shared/ui/theme';

export function EmotionStepScreen() {
  const router = useRouter();
  const { emotionCode, setEmotion } = useRitualDraft();
  const catalog = useEmotions();
  const emotions = catalog.status === 'ready' ? catalog.emotions : [];

  return (
    <RitualStepLayout step={1} title="Comment tu te sens ?" subtitle="Choisis ton émotion du soir">
      {catalog.status === 'failed' ? (
        <Text accessibilityRole="alert" style={styles.error}>
          Impossible d'afficher les émotions pour l'instant.
        </Text>
      ) : null}
      <View accessibilityRole="radiogroup" accessibilityLabel="Émotion du soir" style={styles.grid}>
        {emotions.map((emotion) => {
          const selected = emotion.code === emotionCode;
          return (
            <Pressable
              key={emotion.code}
              accessibilityRole="radio"
              accessibilityLabel={`Émotion ${emotion.label}`}
              accessibilityState={{ selected }}
              onPress={() => setEmotion(emotion.code)}
              style={styles.cell}
            >
              <View style={styles.iconHalo}>
                {selected ? (
                  <SketchShape
                    shape="circle"
                    fill={colors.peach}
                    stroke={colors.ink}
                    strokeWidth={1.6}
                  />
                ) : null}
                <View>
                  <EmotionIcon emotionCode={emotion.code} size={32} />
                </View>
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
          disabled={!emotionCode}
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
    alignItems: 'center',
    justifyContent: 'center',
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
  error: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.error,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 20,
  },
});
