import { ChevronRight } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/ui/theme';

interface SettingsRowProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  /** Élément affiché à droite (interrupteur…) ; chevron par défaut. */
  trailing?: ReactNode;
  onPress?(): void;
  accessibilityHint?: string;
}

/** Rangée ouverte, sans encadré : les écrans les séparent par des filets. */
export function SettingsRow({
  icon,
  title,
  subtitle,
  trailing,
  onPress,
  accessibilityHint,
}: SettingsRowProps) {
  const content = (
    <>
      {icon}
      <View style={styles.texts}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {trailing ?? <ChevronRight size={18} color={colors.overline} strokeWidth={2} />}
    </>
  );

  if (!onPress) {
    return <View style={styles.row}>{content}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 18,
  },
  pressed: {
    opacity: 0.6,
  },
  texts: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.ink,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkSoft,
    marginTop: 1,
  },
});
