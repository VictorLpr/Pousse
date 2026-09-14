import { StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';

import { colors, fonts } from '@/shared/ui/theme';

interface OverlineLabelProps {
  children: string;
  color?: string;
  style?: StyleProp<TextStyle>;
}

/** Petit intitulé en capitales au-dessus d'une section ou d'un champ. */
export function OverlineLabel({ children, color = colors.overline, style }: OverlineLabelProps) {
  return <Text style={[styles.label, { color }, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
