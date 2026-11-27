import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/shared/ui/theme';

interface EmojiChoice {
  readonly emoji: string;
  readonly name: string;
}

// One code point each (no ZWJ sequence, no variation selector): 2 UTF-16 units against the limit.
const EMOJI_CHOICES: readonly EmojiChoice[] = [
  { emoji: '😊', name: 'sourire' },
  { emoji: '🎉', name: 'fête' },
  { emoji: '💪', name: 'courage' },
  { emoji: '🌈', name: 'arc-en-ciel' },
  { emoji: '🌱', name: 'pousse' },
  { emoji: '🤗', name: 'câlin' },
];

interface EmojiRowProps {
  onPick(emoji: string): void;
  canAdd(emoji: string): boolean;
}

/** A row of bare emoji, each one added to the memory's text when tapped. */
export function EmojiRow({ onPick, canAdd }: EmojiRowProps) {
  return (
    <View accessibilityRole="toolbar" accessibilityLabel="Ajouter un emoji" style={styles.row}>
      {EMOJI_CHOICES.map(({ emoji, name }) => {
        const disabled = !canAdd(emoji);
        return (
          <Pressable
            key={emoji}
            accessibilityRole="button"
            accessibilityLabel={`Ajouter l'emoji ${name}`}
            accessibilityState={{ disabled }}
            disabled={disabled}
            onPress={() => onPick(emoji)}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.pressed,
              disabled && styles.disabled,
            ]}
          >
            <Text style={styles.emoji}>{emoji}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
  disabled: {
    opacity: 0.35,
  },
  emoji: {
    fontSize: 24,
    color: colors.ink,
  },
});
