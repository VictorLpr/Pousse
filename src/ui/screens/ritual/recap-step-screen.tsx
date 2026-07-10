import { Redirect, useRouter } from 'expo-router';
import { Image as ImageIcon } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { getEmotion } from '@/domain/entities/emotion';
import { useServices } from '@/di/services-provider';
import { AppButton } from '@/ui/components/app-button';
import { EmotionIcon } from '@/ui/components/emotion-icon';
import { RitualStepLayout } from '@/ui/components/ritual-step-layout';
import { useActiveChild } from '@/ui/state/active-child-context';
import { useRitualDraft } from '@/ui/state/ritual-draft-context';
import { colors, fonts } from '@/ui/theme';

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function RecapStepScreen() {
  const router = useRouter();
  const services = useServices();
  const { activeChild, adoptChild, isLoading } = useActiveChild();
  const { emotionId, prideText, photoUri } = useRitualDraft();
  const [isSaving, setIsSaving] = useState(false);

  if (isLoading) {
    return null;
  }
  if (!activeChild || !emotionId) {
    return <Redirect href="/home" />;
  }

  const saveRitual = async () => {
    setIsSaving(true);
    try {
      const { child } = await services.completeEveningRitual.execute({
        childId: activeChild.id,
        emotionId,
        prideText,
        photoUri,
      });
      adoptChild(child);
      router.replace('/ritual/done');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <RitualStepLayout step={4} title="Notre moment" subtitle="On le garde ensemble ?">
      <View style={styles.recapCard}>
        <View style={styles.emotionRow}>
          <View style={styles.emotionCircle}>
            <EmotionIcon emotionId={emotionId} size={24} />
          </View>
          <Text style={styles.emotionLabel}>{capitalize(getEmotion(emotionId).label)}</Text>
        </View>
        <Text style={styles.prideText}>{prideText}</Text>
        {photoUri ? (
          <View
            accessible
            accessibilityLabel="Photo du jour ajoutée"
            style={styles.photoPlaceholder}>
            <ImageIcon size={30} color={colors.overline} strokeWidth={1.8} />
          </View>
        ) : null}
      </View>
      <AppButton label="On valide ensemble" disabled={isSaving} onPress={saveRitual} />
    </RitualStepLayout>
  );
}

const styles = StyleSheet.create({
  recapCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 22,
    padding: 18,
    gap: 14,
    marginBottom: 16,
  },
  emotionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  emotionCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.peach,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emotionLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: colors.ink,
  },
  prideText: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 22,
    color: colors.ink,
  },
  photoPlaceholder: {
    flex: 1,
    minHeight: 110,
    backgroundColor: colors.sage,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
