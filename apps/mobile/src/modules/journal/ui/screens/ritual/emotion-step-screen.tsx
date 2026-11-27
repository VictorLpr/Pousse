import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/shared/ui/components/app-button';
import { EmotionGrid } from '@/modules/journal/ui/components/emotion-grid';
import { RitualStepLayout } from '@/modules/journal/ui/components/ritual-step-layout';
import { useActiveChild } from '@/modules/auth/ui/state/active-child-context';
import { useEmotions } from '@/modules/journal/ui/hooks/use-emotions';
import { useRitualStepNavigation } from '@/modules/journal/ui/hooks/use-ritual-step-navigation';
import { useRitualDraft } from '@/modules/journal/ui/state/ritual-draft-context';
import { colors, fonts } from '@/shared/ui/theme';

export function EmotionStepScreen() {
  const { goNext } = useRitualStepNavigation('/ritual/pride');
  const { activeChild } = useActiveChild();
  const { emotionCode, setEmotion } = useRitualDraft();
  const catalog = useEmotions();
  const emotions = catalog.status === 'ready' ? catalog.emotions : [];

  return (
    <RitualStepLayout
      step={1}
      title="Comment tu te sens ?"
      subtitle="Choisis ton émotion, on en parle ensemble"
    >
      {catalog.status === 'failed' ? (
        <Text accessibilityRole="alert" style={styles.error}>
          Impossible d'afficher les émotions pour l'instant.
        </Text>
      ) : null}
      <EmotionGrid
        emotions={emotions}
        selectedCode={emotionCode}
        onSelect={setEmotion}
        ageRange={activeChild?.ageRange}
      />
      <View style={styles.footer}>
        <AppButton label="Continuer" disabled={!emotionCode} onPress={goNext} />
      </View>
    </RitualStepLayout>
  );
}

const styles = StyleSheet.create({
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
