import { Flame } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/ui/theme';

interface StreakBadgeProps {
  label: string;
  backgroundColor?: string;
}

export function StreakBadge({ label, backgroundColor = colors.sage }: StreakBadgeProps) {
  return (
    <View
      accessible
      accessibilityLabel={`Série en cours : ${label}`}
      style={[styles.badge, { backgroundColor }]}>
      <Flame size={16} color={colors.ink} fill={colors.coral} strokeWidth={1.6} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: 'center',
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.ink,
  },
});
