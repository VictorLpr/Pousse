import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { getEmotion } from '@/domain/entities/emotion';
import type { JournalEntry } from '@/domain/entities/journal-entry';
import { useServices } from '@/di/services-provider';
import { EmotionIcon } from '@/ui/components/emotion-icon';
import { OverlineLabel } from '@/ui/components/overline-label';
import { ScreenContainer } from '@/ui/components/screen-container';
import { ScreenHeader } from '@/ui/components/screen-header';
import { formatFullDate } from '@/ui/format/date';
import { useActiveChild } from '@/ui/state/active-child-context';
import { colors, fonts } from '@/ui/theme';

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function JournalScreen() {
  const services = useServices();
  const { activeChild, isLoading } = useActiveChild();
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  useEffect(() => {
    if (activeChild) {
      services.getJournalEntries.execute(activeChild.id).then(setEntries);
    }
  }, [services, activeChild]);

  if (isLoading) {
    return <ScreenContainer scrollable={false}>{null}</ScreenContainer>;
  }
  if (!activeChild) {
    return <Redirect href="/" />;
  }

  return (
    <ScreenContainer>
      <ScreenHeader
        title={`Le journal de ${activeChild.firstName}`}
        subtitle={`${entries.length} souvenir${entries.length > 1 ? 's' : ''} gardé${entries.length > 1 ? 's' : ''}`}
      />

      <OverlineLabel style={styles.sectionLabel}>Cette semaine</OverlineLabel>
      <View style={styles.list}>
        {entries.map((entry, index) => {
          const isLatest = index === 0;
          return (
            <View
              key={entry.id}
              accessible
              accessibilityLabel={`Souvenir du ${formatFullDate(entry.createdAt)}, émotion ${getEmotion(entry.emotionId).label} : ${entry.prideText}`}
              style={[styles.entryCard, isLatest && styles.latestEntryCard]}>
              <View style={styles.entryHeader}>
                <View
                  style={[
                    styles.emotionCircle,
                    { backgroundColor: isLatest ? colors.background : colors.sage },
                  ]}>
                  <EmotionIcon emotionId={entry.emotionId} size={20} />
                </View>
                <View>
                  <Text style={styles.emotionLabel}>
                    {capitalize(getEmotion(entry.emotionId).label)}
                  </Text>
                  <Text style={styles.entryDate}>{formatFullDate(entry.createdAt)}</Text>
                </View>
              </View>
              <Text style={styles.entryText}>{entry.prideText}</Text>
            </View>
          );
        })}
        {entries.length === 0 && (
          <Text style={styles.emptyText}>
            Aucun souvenir pour l'instant. Le rituel du soir remplira ce journal !
          </Text>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    marginTop: 8,
    marginBottom: 12,
    letterSpacing: 0.7,
  },
  list: {
    gap: 12,
  },
  entryCard: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 16,
    gap: 9,
  },
  latestEntryCard: {
    backgroundColor: colors.peach,
    borderColor: colors.peach,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  emotionCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emotionLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.ink,
  },
  entryDate: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkSoft,
  },
  entryText: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 20,
    color: colors.ink,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 22,
    color: colors.inkSoft,
    textAlign: 'center',
    marginTop: 24,
  },
});
