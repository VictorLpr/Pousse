import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/ui/theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
}

export function ScreenHeader({ title, subtitle, showBackButton = true }: ScreenHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.header}>
      {showBackButton && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Revenir en arrière"
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={8}>
          <ChevronLeft size={20} color={colors.ink} strokeWidth={2.2} />
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
    alignItems: 'center',
    gap: 12,
    marginBottom: 22,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.sage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titles: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 28,
    lineHeight: 30,
    color: colors.ink,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.inkSoft,
  },
});
