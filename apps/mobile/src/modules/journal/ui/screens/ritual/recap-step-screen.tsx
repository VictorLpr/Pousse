import { Redirect, useRouter } from 'expo-router';
import { Image as ImageIcon, ImagePlus } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useServices } from '@/di/services-provider';
import { entryPhotoOf } from '@/modules/journal/domain/entities/photo';
import { AppButton } from '@/shared/ui/components/app-button';
import { Divider } from '@/shared/ui/components/divider';
import { SketchShape } from '@/shared/ui/components/sketch-shape';
import { EmotionIcon } from '@/modules/journal/ui/components/emotion-icon';
import { emotionLabel } from '@/modules/journal/ui/format/emotion';
import { journalErrorMessage } from '@/modules/journal/ui/format/journal-error';
import { RitualStepLayout } from '@/modules/journal/ui/components/ritual-step-layout';
import { useActiveChild } from '@/modules/auth/ui/state/active-child-context';
import { useEmotions } from '@/modules/journal/ui/hooks/use-emotions';
import { FROM_RECAP } from '@/modules/journal/ui/hooks/use-ritual-step-navigation';
import { useRitualDraft } from '@/modules/journal/ui/state/ritual-draft-context';
import { colors, fonts } from '@/shared/ui/theme';

const EDIT_HINT = "Ouvre l'étape, puis revient au récap";

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function RecapStepScreen() {
  const router = useRouter();
  const services = useServices();
  const { activeChild, isLoading } = useActiveChild();
  const { date, emotionCode, text, photo } = useRitualDraft();
  const catalog = useEmotions();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (isLoading) {
    return null;
  }
  if (!activeChild || !emotionCode) {
    return <Redirect href="/home" />;
  }

  const label = emotionLabel(catalog, emotionCode);

  const editStep = (step: 'emotion' | 'pride' | 'photo') => {
    setErrorMessage(null);
    router.push(`/ritual/${step}?from=${FROM_RECAP}`);
  };

  const saveRitual = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    try {
      await services.completeEveningRitual.execute({
        childId: activeChild.id,
        emotionCode,
        text,
        date,
        photo: photo && entryPhotoOf(photo),
      });
      router.replace('/ritual/done');
    } catch (error) {
      setErrorMessage(journalErrorMessage(error, 'Impossible de garder ce moment, réessayez.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <RitualStepLayout step={4} title="Notre moment" subtitle="On le garde ensemble ?">
      <View style={styles.emotionRow}>
        <EmotionIcon emotionCode={emotionCode} size={34} />
        <Text style={styles.emotionLabel}>{label ? capitalize(label) : null}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Modifier l'émotion"
        accessibilityHint={EDIT_HINT}
        disabled={isSaving}
        accessibilityState={{ disabled: isSaving }}
        onPress={() => editStep('emotion')}
        style={({ pressed }) => [
          styles.editButton,
          isSaving && styles.disabled,
          pressed && styles.pressed,
        ]}
        hitSlop={8}
      >
        <Text style={styles.editLabel}>Modifier</Text>
      </Pressable>

      <Divider variant="stitched" spacing={12} />

      <View style={styles.prideQuote}>
        <View style={styles.quoteBar} />
        <Text style={styles.prideText}>{text}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Modifier le moment de fierté"
        accessibilityHint={EDIT_HINT}
        disabled={isSaving}
        accessibilityState={{ disabled: isSaving }}
        onPress={() => editStep('pride')}
        style={({ pressed }) => [
          styles.editButton,
          isSaving && styles.disabled,
          pressed && styles.pressed,
        ]}
        hitSlop={8}
      >
        <Text style={styles.editLabel}>Modifier</Text>
      </Pressable>

      {photo ? (
        <>
          <View
            accessible
            accessibilityLabel="Photo du jour ajoutée"
            style={styles.photoPlaceholder}
          >
            <ImageIcon size={30} color={colors.overline} strokeWidth={1.8} />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Modifier la photo"
            accessibilityHint={EDIT_HINT}
            disabled={isSaving}
            accessibilityState={{ disabled: isSaving }}
            onPress={() => editStep('photo')}
            style={({ pressed }) => [
              styles.editButton,
              isSaving && styles.disabled,
              pressed && styles.pressed,
            ]}
            hitSlop={8}
          >
            <Text style={styles.editLabel}>Modifier</Text>
          </Pressable>
        </>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ajouter une photo"
          accessibilityHint={EDIT_HINT}
          disabled={isSaving}
          accessibilityState={{ disabled: isSaving }}
          onPress={() => editStep('photo')}
          style={({ pressed }) => [
            styles.addPhoto,
            isSaving && styles.disabled,
            pressed && styles.pressed,
          ]}
        >
          <SketchShape
            shape="rectangle"
            radius={20}
            stroke={colors.dashedBorder}
            strokeWidth={2}
            dashed
          />
          <ImagePlus size={24} color={colors.moss} strokeWidth={1.8} />
          <Text style={styles.addPhotoLabel}>Ajouter une photo</Text>
        </Pressable>
      )}

      <View style={styles.footer}>
        {errorMessage ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {errorMessage}
          </Text>
        ) : null}
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
    marginTop: 12,
  },
  editButton: {
    alignSelf: 'flex-end',
    minHeight: 44,
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
  disabled: {
    opacity: 0.45,
  },
  editLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.inkSoft,
    textDecorationLine: 'underline',
  },
  addPhoto: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 72,
    marginTop: 12,
  },
  addPhotoLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.moss,
  },
  error: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.error,
    marginBottom: 8,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 20,
  },
});
