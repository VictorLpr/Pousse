import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useInShell } from '@/ui/components/app-shell';
import { colors, fonts } from '@/ui/theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
}

export function ScreenHeader({ title, subtitle, showBackButton = true }: ScreenHeaderProps) {
  const router = useRouter();
  const inShell = useInShell();

  return (
    <View style={styles.header}>
      {showBackButton && !inShell && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Revenir en arrière"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          hitSlop={12}>
          <ChevronLeft size={26} color={colors.ink} strokeWidth={2} />
        </Pressable>
      )}
      <View style={styles.titles}>
        <Text accessibilityRole="header" style={styles.title}>
          {title}
        </Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 26,
  },
  backButton: {
    marginTop: 4,
    marginLeft: -6,
  },
  pressed: {
    opacity: 0.6,
  },
  titles: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 32,
    lineHeight: 34,
    color: colors.ink,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.inkSoft,
  },
});
