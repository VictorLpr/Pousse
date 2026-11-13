import { Redirect } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import type { JournalEntry } from '@/modules/journal';
import { useServices } from '@/di/services-provider';
import { emotionLabel } from '@/modules/journal/ui/format/emotion';
import { useEmotions } from '@/modules/journal/ui/hooks/use-emotions';
import { AppShell } from '@/shared/ui/components/app-shell';
import { OverlineLabel } from '@/shared/ui/components/overline-label';
import { ScreenContainer } from '@/shared/ui/components/screen-container';
import { ScreenHeader } from '@/shared/ui/components/screen-header';
import { SketchShape } from '@/shared/ui/components/sketch-shape';
import { formatMonth, formatShortDate } from '@/shared/ui/format/date';
import { useActiveChild } from '@/modules/auth/ui/state/active-child-context';
import { colors, fonts } from '@/shared/ui/theme';

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function GalleryScreen() {
  const services = useServices();
  const { activeChild, isLoading } = useActiveChild();
  const [entriesWithPhoto, setEntriesWithPhoto] = useState<JournalEntry[]>([]);
  const [loadFailed, setLoadFailed] = useState(false);
  const catalog = useEmotions();

  useEffect(() => {
    if (activeChild) {
      services.getJournalEntries
        .execute(activeChild.id)
        .then((entries) => {
          setEntriesWithPhoto(entries.filter((entry) => entry.photo !== null));
          setLoadFailed(false);
        })
        .catch(() => setLoadFailed(true));
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
    <AppShell route="gallery">
      <ScreenHeader
        title={`Galerie de ${activeChild.firstName}`}
        subtitle={`${photoCount} photo${photoCount > 1 ? 's' : ''} gardée${photoCount > 1 ? 's' : ''}`}
      />

      {loadFailed ? (
        <Text accessibilityRole="alert" style={styles.error}>
          Impossible d'afficher les photos pour l'instant.
        </Text>
      ) : null}

      {monthLabel && <OverlineLabel style={styles.monthLabel}>{monthLabel}</OverlineLabel>}

      <View style={styles.grid}>
        {entriesWithPhoto.map((entry) => {
          const label = capitalize(emotionLabel(catalog, entry.emotionCode) ?? '');
          const dateLabel = formatShortDate(entry.createdAt);
          return (
            <View
              key={entry.id}
              accessible
              accessibilityLabel={`Photo souvenir, ${label}, ${dateLabel}`}
              style={styles.item}
            >
              <View
                style={[
                  styles.photo,
                  { backgroundColor: entry.emotionCode === 'proud' ? colors.peach : colors.sage },
                ]}
              />
              <Text style={styles.caption}>
                <Text style={styles.captionEmotion}>{label}</Text> · {dateLabel}
              </Text>
            </View>
          );
        })}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ajouter une photo"
          accessibilityHint="Bientôt disponible"
          onPress={() =>
            Alert.alert(
              'Bientôt disponible',
              "L'ajout de photos arrive dans une prochaine version.",
            )
          }
          style={({ pressed }) => [styles.item, pressed && styles.pressed]}
        >
          <View style={[styles.photo, styles.addTile]}>
            <SketchShape
              shape="rectangle"
              radius={20}
              stroke={colors.dashedBorder}
              strokeWidth={2}
              dashed
            />
            <View>
              <Plus size={26} color={colors.moss} strokeWidth={1.8} />
            </View>
          </View>
          <Text style={[styles.caption, styles.addCaption]}>Ajouter</Text>
        </Pressable>
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  error: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.error,
    marginBottom: 14,
  },
  monthLabel: {
    marginBottom: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 14,
    rowGap: 18,
  },
  item: {
    flexBasis: '46%',
    flexGrow: 1,
    gap: 7,
  },
  photo: {
    aspectRatio: 1,
    borderRadius: 20,
  },
  caption: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkSoft,
  },
  captionEmotion: {
    fontFamily: fonts.bodySemiBold,
    color: colors.ink,
  },
  addTile: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  addCaption: {
    color: colors.moss,
  },
});
