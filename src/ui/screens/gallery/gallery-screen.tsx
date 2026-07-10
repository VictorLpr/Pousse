import { Redirect } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { getEmotion } from '@/domain/entities/emotion';
import type { JournalEntry } from '@/domain/entities/journal-entry';
import { useServices } from '@/di/services-provider';
import { OverlineLabel } from '@/ui/components/overline-label';
import { ScreenContainer } from '@/ui/components/screen-container';
import { ScreenHeader } from '@/ui/components/screen-header';
import { formatMonth, formatShortDate } from '@/ui/format/date';
import { useActiveChild } from '@/ui/state/active-child-context';
import { colors, fonts } from '@/ui/theme';

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function GalleryScreen() {
  const services = useServices();
  const { activeChild, isLoading } = useActiveChild();
  const [entriesWithPhoto, setEntriesWithPhoto] = useState<JournalEntry[]>([]);

  useEffect(() => {
    if (activeChild) {
      services.getJournalEntries
        .execute(activeChild.id)
        .then((entries) => setEntriesWithPhoto(entries.filter((entry) => entry.photoUri !== null)));
    }
  }, [services, activeChild]);

  if (isLoading) {
    return <ScreenContainer scrollable={false}>{null}</ScreenContainer>;
  }
  if (!activeChild) {
    return <Redirect href="/" />;
  }

  const photoCount = entriesWithPhoto.length;
  const monthLabel = photoCount > 0 ? formatMonth(entriesWithPhoto[0].createdAt) : null;

  return (
    <ScreenContainer>
      <ScreenHeader
        title={`Galerie de ${activeChild.firstName}`}
        subtitle={`${photoCount} photo${photoCount > 1 ? 's' : ''} gardée${photoCount > 1 ? 's' : ''}`}
      />

      {monthLabel && <OverlineLabel style={styles.monthLabel}>{monthLabel}</OverlineLabel>}

      <View style={styles.grid}>
        {entriesWithPhoto.map((entry) => {
          const emotionLabel = capitalize(getEmotion(entry.emotionId).label);
          const dateLabel = formatShortDate(entry.createdAt);
          return (
            <View
              key={entry.id}
              accessible
              accessibilityLabel={`Photo souvenir, ${emotionLabel}, ${dateLabel}`}
              style={[
                styles.tile,
                { backgroundColor: entry.emotionId === 'fier' ? colors.peach : colors.sage },
              ]}>
              <Text style={styles.tileBadge}>
                {emotionLabel} · {dateLabel}
              </Text>
            </View>
          );
        })}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ajouter une photo"
          accessibilityHint="Bientôt disponible"
          onPress={() =>
            Alert.alert('Bientôt disponible', "L'ajout de photos arrive dans une prochaine version.")
          }
          style={({ pressed }) => [styles.tile, styles.addTile, pressed && styles.pressed]}>
          <Plus size={26} color={colors.moss} strokeWidth={1.8} />
          <Text style={styles.addLabel}>Ajouter</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  monthLabel: {
    marginBottom: 12,
    letterSpacing: 0.7,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tile: {
    flexBasis: '45%',
    flexGrow: 1,
    aspectRatio: 1,
    borderRadius: 20,
    padding: 10,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  tileBadge: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.ink,
    backgroundColor: colors.background,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  addTile: {
    backgroundColor: colors.background,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.dashedBorder,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  pressed: {
    opacity: 0.8,
  },
  addLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.moss,
  },
});
