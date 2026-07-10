import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/ui/theme';

interface AvatarProps {
  initial: string;
  size?: number;
  backgroundColor?: string;
  /** Anneau extérieur pêche autour de l'initiale, comme sur l'accueil. */
  withRing?: boolean;
}

export function Avatar({
  initial,
  size = 52,
  backgroundColor = colors.peach,
  withRing = false,
}: AvatarProps) {
  const circle = { width: size, height: size, borderRadius: size / 2 };
  const fontSize = size * 0.5;

  if (withRing) {
    const innerSize = size * 0.78;
    return (
      <View
        accessible
        accessibilityLabel={`Avatar de l'enfant, initiale ${initial}`}
        style={[styles.circle, circle, { backgroundColor: colors.peach }]}>
        <View
          style={[
            styles.circle,
            {
              width: innerSize,
              height: innerSize,
              borderRadius: innerSize / 2,
              backgroundColor: colors.background,
            },
          ]}>
          <Text style={[styles.initial, { fontSize: innerSize * 0.55 }]}>{initial}</Text>
        </View>
      </View>
    );
  }

  return (
    <View
      accessible
      accessibilityLabel={`Avatar de l'enfant, initiale ${initial}`}
      style={[styles.circle, circle, { backgroundColor }]}>
      <Text style={[styles.initial, { fontSize }]}>{initial}</Text>
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
