import { Redirect } from 'expo-router';
import { Fragment, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { getEmotion } from '@/domain/entities/emotion';
import type { JournalEntry } from '@/domain/entities/journal-entry';
import { useServices } from '@/di/services-provider';
import { AppShell } from '@/ui/components/app-shell';
import { Divider } from '@/ui/components/divider';
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
    <AppShell route="journal">
      <ScreenHeader
        title={`Le journal de ${activeChild.firstName}`}
        subtitle={`${entries.length} souvenir${entries.length > 1 ? 's' : ''} gardé${entries.length > 1 ? 's' : ''}`}
      />

      <OverlineLabel style={styles.sectionLabel}>Cette semaine</OverlineLabel>

      {entries.map((entry, index) => (
        <Fragment key={entry.id}>
          {index > 0 && <Divider />}
          <View
            accessible
            accessibilityLabel={`Souvenir du ${formatFullDate(entry.createdAt)}, émotion ${getEmotion(entry.emotionId).label} : ${entry.prideText}`}
            style={styles.entry}>
            <View style={styles.entryIcon}>
              <EmotionIcon emotionId={entry.emotionId} size={26} />
            </View>
            <View style={styles.entryContent}>
              <View style={styles.entryHeader}>
                <Text style={styles.emotionName}>
                  {capitalize(getEmotion(entry.emotionId).label)}
                </Text>
                <Text style={styles.entryDate}>{formatFullDate(entry.createdAt)}</Text>
              </View>
              <Text style={styles.entryText}>{entry.prideText}</Text>
            </View>
          </View>
        </Fragment>
      ))}

      {entries.length === 0 && (
        <Text style={styles.emptyText}>
          Aucun souvenir pour l'instant. Le rituel du soir remplira ce journal !
        </Text>
      )}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    marginBottom: 6,
  },
  entry: {
    flexDirection: 'row',
    gap: 14,
    paddingVertical: 18,
  },
  entryIcon: {
    marginTop: 2,
  },
  entryContent: {
    flex: 1,
    gap: 6,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 8,
  },
  emotionName: {
    fontFamily: fonts.heading,
    fontSize: 24,
    lineHeight: 26,
    color: colors.ink,
  },
  entryDate: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkSoft,
  },
  entryText: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 22,
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
