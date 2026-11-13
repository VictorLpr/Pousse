import { useRouter } from 'expo-router';
import { Camera, ChevronRight, Image as ImageIcon } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useServices } from '@/di/services-provider';
import { AppButton } from '@/shared/ui/components/app-button';
import { Divider } from '@/shared/ui/components/divider';
import { RitualStepLayout } from '@/modules/journal/ui/components/ritual-step-layout';
import { useRitualDraft } from '@/modules/journal/ui/state/ritual-draft-context';
import { colors, fonts } from '@/shared/ui/theme';

export function PhotoStepScreen() {
  const router = useRouter();
  const services = useServices();
  const { setPhoto } = useRitualDraft();
  const [pickFailed, setPickFailed] = useState(false);

  const continueWithPhoto = async () => {
    setPickFailed(false);
    try {
      setPhoto(await services.pickRitualPhoto.execute());
      router.push('/ritual/recap');
    } catch {
      setPickFailed(true);
    }
  };

  const skipPhoto = () => {
    setPhoto(null);
    router.push('/ritual/recap');
  };

  return (
    <RitualStepLayout step={3} title="Une photo du jour ?" subtitle="C'est toi qui choisis">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Prendre une photo"
        onPress={continueWithPhoto}
        style={({ pressed }) => [styles.option, pressed && styles.pressed]}
      >
        <Camera size={26} color={colors.ink} strokeWidth={1.8} />
        <Text style={styles.optionLabel}>Prendre une photo</Text>
        <ChevronRight size={18} color={colors.overline} strokeWidth={2} />
      </Pressable>

      <Divider />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Choisir dans la galerie"
        onPress={continueWithPhoto}
        style={({ pressed }) => [styles.option, pressed && styles.pressed]}
      >
        <ImageIcon size={26} color={colors.ink} strokeWidth={1.8} />
        <Text style={styles.optionLabel}>Choisir dans la galerie</Text>
        <ChevronRight size={18} color={colors.overline} strokeWidth={2} />
      </Pressable>

      <Divider />

      {pickFailed ? (
        <Text accessibilityRole="alert" style={styles.error}>
          Impossible de récupérer la photo, réessayez ou passez cette étape.
        </Text>
      ) : null}

      <View style={styles.footer}>
        <AppButton label="Passer cette étape" variant="ghost" onPress={skipPhoto} />
      </View>
    </RitualStepLayout>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 24,
  },
  pressed: {
    opacity: 0.6,
  },
  optionLabel: {
    flex: 1,
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: colors.ink,
  },
  error: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.error,
    marginTop: 16,
  },
  footer: {
    marginTop: 'auto',
  },
});
