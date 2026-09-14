import { Flame } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/shared/ui/theme';

interface StreakBadgeProps {
  label: string;
}

/** Série de soirs, affichée nue : flamme + texte, sans pastille. */
export function StreakBadge({ label }: StreakBadgeProps) {
  return (
    <View accessible accessibilityLabel={`Série en cours : ${label}`} style={styles.row}>
      <Flame size={16} color={colors.ink} fill={colors.coral} strokeWidth={1.6} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    alignSelf: 'center',
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.ink,
  },
});
