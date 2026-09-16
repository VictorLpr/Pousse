import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';

import { SketchShape } from '@/shared/ui/components/sketch-shape';
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
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      {({ pressed }) => (
        <>
          {variant !== 'ghost' ? (
            <SketchShape
              shape="rectangle"
              radius={20}
              // Décalage de graine à l'appui : le trait « frémit » comme un dessin refait.
              seedOffset={pressed && !disabled ? 1 : 0}
              {...sketchStyles[variant]}
            />
          ) : null}
          {icon ? <View style={styles.icon}>{icon}</View> : null}
          <Text style={[styles.label, variant === 'ghost' && styles.ghostLabel]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

const sketchStyles = {
  coral: { fill: colors.coral, stroke: colors.ink, strokeWidth: 1.6 },
  cream: { fill: colors.background, stroke: colors.sageDeep, strokeWidth: 1.6 },
} as const;

const styles = StyleSheet.create({
  base: {
    width: '100%',
    flexDirection: 'row',
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  pressed: {
    transform: [{ translateY: 1 }],
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
