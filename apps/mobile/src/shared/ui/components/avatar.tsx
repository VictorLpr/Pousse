import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/shared/ui/theme';

interface AvatarProps {
  initial: string;
  size?: number;
  backgroundColor?: string;
}

export function Avatar({ initial, size = 52, backgroundColor = colors.peach }: AvatarProps) {
  return (
    <View
      accessible
      accessibilityLabel={`Avatar de l'enfant, initiale ${initial}`}
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2, backgroundColor },
      ]}
    >
      <Text style={[styles.initial, { fontSize: size * 0.52 }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    fontFamily: fonts.heading,
    color: colors.ink,
  },
});
