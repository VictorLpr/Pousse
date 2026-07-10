import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/ui/theme';

interface ScreenContainerProps extends PropsWithChildren {
  /** Fait défiler le contenu (par défaut) ou l'affiche en pleine hauteur. */
  scrollable?: boolean;
  backgroundColor?: string;
  contentStyle?: StyleProp<ViewStyle>;
}

export function ScreenContainer({
  children,
  scrollable = true,
  backgroundColor = colors.background,
  contentStyle,
}: ScreenContainerProps) {
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      {scrollable ? (
        <ScrollView
          contentContainerStyle={[styles.content, contentStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, styles.fill, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 32,
  },
  fill: {
    flex: 1,
  },
});
