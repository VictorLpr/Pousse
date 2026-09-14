import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';

import { colors, fonts } from '@/shared/ui/theme';

type ButtonVariant = 'coral' | 'cream' | 'ghost';

interface AppButtonProps {
  label: string;
  onPress(): void;
  variant?: ButtonVariant;
  disabled?: boolean;
  accessibilityHint?: string;
  icon?: ReactNode;
}

export function AppButton({
  label,
  onPress,
  variant = 'coral',
  disabled = false,
  accessibilityHint,
  icon,
}: AppButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Text style={[styles.label, variant === 'ghost' && styles.ghostLabel]}>{label}</Text>
    </Pressable>
  );
}

const variantStyles = StyleSheet.create({
  coral: {
    backgroundColor: colors.coral,
  },
  cream: {
    backgroundColor: colors.background,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
});

const styles = StyleSheet.create({
  base: {
    width: '100%',
    flexDirection: 'row',
    paddingVertical: 17,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.45,
  },
  icon: {
    marginRight: 2,
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.ink,
  },
  ghostLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.inkSoft,
  },
});
