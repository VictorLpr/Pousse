import { useRouter } from 'expo-router';
import { Camera, ChevronRight, Image as ImageIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/ui/components/app-button';
import { Divider } from '@/ui/components/divider';
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
        style={({ pressed }) => [styles.option, pressed && styles.pressed]}>
        <Camera size={26} color={colors.ink} strokeWidth={1.8} />
        <Text style={styles.optionLabel}>Prendre une photo</Text>
        <ChevronRight size={18} color={colors.overline} strokeWidth={2} />
      </Pressable>

      <Divider />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Choisir dans la galerie"
        onPress={continueWithPhoto}
        style={({ pressed }) => [styles.option, pressed && styles.pressed]}>
        <ImageIcon size={26} color={colors.ink} strokeWidth={1.8} />
        <Text style={styles.optionLabel}>Choisir dans la galerie</Text>
        <ChevronRight size={18} color={colors.overline} strokeWidth={2} />
      </Pressable>

      <Divider />

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
  footer: {
    marginTop: 'auto',
  },
});
