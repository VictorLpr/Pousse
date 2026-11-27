import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/shared/ui/components/app-button';
import type { AsyncData } from '@/shared/ui/hooks/use-async-data';
import { colors, fonts } from '@/shared/ui/theme';

interface LoadStatusProps {
  status: AsyncData<unknown>['status'];
  /** Announced while loading, e.g. « Chargement du journal ». */
  loadingLabel: string;
  /** Shown when loading failed, e.g. « Impossible d'afficher le journal pour l'instant. » */
  errorMessage: string;
  onRetry(): void;
}

/** What a screen shows in place of its data until the data is ready. */
export function LoadStatus({ status, loadingLabel, errorMessage, onRetry }: LoadStatusProps) {
  switch (status) {
    case 'loading':
      return (
        <View style={styles.loading}>
          <ActivityIndicator
            accessibilityRole="progressbar"
            accessibilityLabel={loadingLabel}
            color={colors.moss}
            size="large"
          />
        </View>
      );
    case 'failed':
      return (
        <View style={styles.failed}>
          <Text accessibilityRole="alert" style={styles.error}>
            {errorMessage}
          </Text>
          <AppButton label="Réessayer" variant="cream" onPress={onRetry} />
        </View>
      );
    case 'ready':
      return null;
  }
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  failed: {
    gap: 16,
    paddingVertical: 24,
  },
  error: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    lineHeight: 20,
    color: colors.error,
  },
});
