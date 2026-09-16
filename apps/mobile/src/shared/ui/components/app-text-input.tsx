import { StyleSheet, TextInput, View } from 'react-native';
import type { TextInputProps } from 'react-native';

import { SketchShape } from '@/shared/ui/components/sketch-shape';
import { colors, fonts } from '@/shared/ui/theme';

interface AppTextInputProps extends TextInputProps {
  /** Espace laissé sous le champ, avant l'élément suivant. */
  spacing?: number;
}

/** Champ « souligné » : pas de boîte, un trait tracé à la main sous le texte. */
export function AppTextInput({ spacing = 0, style, ...props }: AppTextInputProps) {
  return (
    <View style={[styles.wrapper, { marginBottom: spacing }]}>
      <SketchShape shape="underline" stroke={colors.border} strokeWidth={2} roughness={1.1} />
      <TextInput placeholderTextColor={colors.overline} style={[styles.input, style]} {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: 12,
  },
  input: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 17,
    color: colors.ink,
  },
});
