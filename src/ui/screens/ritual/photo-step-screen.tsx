import { useRouter } from 'expo-router';
import { Camera, Image as ImageIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, Text } from 'react-native';

import { AppButton } from '@/ui/components/app-button';
import { RitualStepLayout } from '@/ui/components/ritual-step-layout';
import { useRitualDraft } from '@/ui/state/ritual-draft-context';
import { colors, fonts } from '@/ui/theme';

/**
 * L'appareil photo et la galerie ne sont pas encore branchés :
 * on garde une photo « souvenir » symbolique en attendant l'API.
 */
const PLACEHOLDER_PHOTO_URI = 'memory://photo-placeholder';

export function PhotoStepScreen() {
  const router = useRouter();
  const { setPhotoUri } = useRitualDraft();

  const continueWithPhoto = () => {
    setPhotoUri(PLACEHOLDER_PHOTO_URI);
    router.push('/ritual/recap');
  };

  const skipPhoto = () => {
    setPhotoUri(null);
    router.push('/ritual/recap');
  };

  return (
    <RitualStepLayout step={3} title="Une photo du jour ?" subtitle="C'est toi qui choisis">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Prendre une photo"
        onPress={continueWithPhoto}
        style={({ pressed }) => [styles.option, styles.cameraOption, pressed && styles.pressed]}>
        <Camera size={34} color={colors.ink} strokeWidth={1.8} />
        <Text style={styles.optionLabel}>Prendre une photo</Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Choisir dans la galerie"
        onPress={continueWithPhoto}
        style={({ pressed }) => [styles.option, styles.galleryOption, pressed && styles.pressed]}>
        <ImageIcon size={34} color={colors.ink} strokeWidth={1.8} />
        <Text style={styles.optionLabel}>Choisir dans la galerie</Text>
      </Pressable>

      <AppButton label="Passer cette étape" variant="ghost" onPress={skipPhoto} />
    </RitualStepLayout>
  );
}

const styles = StyleSheet.create({
  option: {
    borderRadius: 20,
    paddingVertical: 28,
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  cameraOption: {
    backgroundColor: colors.peach,
  },
  galleryOption: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.85,
  },
  optionLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.ink,
  },
});
