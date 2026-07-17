import { Redirect, useRouter } from 'expo-router';
import { Image as ImageIcon } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { getEmotion } from '@/domain/entities/emotion';
import { useServices } from '@/di/services-provider';
import { AppButton } from '@/ui/components/app-button';
import { Divider } from '@/ui/components/divider';
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
      <View style={styles.emotionRow}>
        <EmotionIcon emotionId={emotionId} size={34} />
        <Text style={styles.emotionLabel}>{capitalize(getEmotion(emotionId).label)}</Text>
      </View>

      <Divider variant="stitched" spacing={20} />

      <View style={styles.prideQuote}>
        <View style={styles.quoteBar} />
        <Text style={styles.prideText}>{prideText}</Text>
      </View>

      {photoUri ? (
        <View accessible accessibilityLabel="Photo du jour ajoutée" style={styles.photoPlaceholder}>
          <ImageIcon size={30} color={colors.overline} strokeWidth={1.8} />
        </View>
      ) : null}

      <View style={styles.footer}>
        <AppButton label="On valide ensemble" disabled={isSaving} onPress={saveRitual} />
      </View>
    </RitualStepLayout>
  );
}

const styles = StyleSheet.create({
  emotionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emotionLabel: {
    fontFamily: fonts.heading,
    fontSize: 32,
    lineHeight: 34,
    color: colors.ink,
  },
  prideQuote: {
    flexDirection: 'row',
    gap: 12,
  },
  quoteBar: {
    width: 3,
    borderRadius: 2,
    backgroundColor: colors.coral,
  },
  prideText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 25,
    color: colors.ink,
  },
  photoPlaceholder: {
    height: 130,
    backgroundColor: colors.sage,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 20,
  },
});
