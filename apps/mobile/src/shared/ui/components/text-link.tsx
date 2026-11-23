import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, fonts } from '@/shared/ui/theme';

interface TextLinkProps {
  label: string;
  onPress(): void;
  accessibilityHint?: string;
}

/** Underlined inline link, read as a link: for opening a page, not for an action. */
export function TextLink({ label, onPress, accessibilityHint }: TextLinkProps) {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      style={({ pressed }) => [styles.link, pressed && styles.pressed]}
      hitSlop={8}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  pressed: {
    opacity: 0.6,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.inkSoft,
    textDecorationLine: 'underline',
  },
});
