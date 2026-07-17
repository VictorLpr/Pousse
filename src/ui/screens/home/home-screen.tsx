import { Redirect, useRouter } from 'expo-router';
import { BookOpen, Menu, Trophy } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppShell, useInShell } from '@/ui/components/app-shell';
import { RITUAL_STEP_COUNT } from '@/ui/components/ritual-step-layout';
import { Avatar } from '@/ui/components/avatar';
import { Divider } from '@/ui/components/divider';
import { ScreenContainer } from '@/ui/components/screen-container';
import { StreakBadge } from '@/ui/components/streak-badge';
import { childInitial, streakLabel } from '@/ui/format/child';
import { useActiveChild } from '@/ui/state/active-child-context';
import { useRitualDraft } from '@/ui/state/ritual-draft-context';
import { colors, fonts } from '@/ui/theme';

export function HomeScreen() {
  const router = useRouter();
  const { activeChild, isLoading } = useActiveChild();
  const { resetDraft } = useRitualDraft();

  if (isLoading) {
    return <ScreenContainer scrollable={false}>{null}</ScreenContainer>;
  }
  if (!activeChild) {
    return <Redirect href="/" />;
  }

  const startRitual = () => {
    resetDraft();
    router.push('/ritual/emotion');
  };

  return (
    <AppShell route="home">
      <HomeTopBar />

      <View style={styles.childZone}>
        <Avatar initial={childInitial(activeChild.firstName)} size={140} />
        <Text style={styles.childName}>{activeChild.firstName}</Text>
        <StreakBadge label={streakLabel(activeChild)} />
      </View>

      <Divider variant="sprout" spacing={28} />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Commencer notre moment du soir"
        accessibilityHint={`${RITUAL_STEP_COUNT} étapes, environ 5 minutes`}
        onPress={startRitual}
        style={({ pressed }) => [styles.ritualCta, pressed && styles.pressed]}
      >
        <Text style={styles.ritualTitle}>Notre moment du soir</Text>
        <Text style={styles.ritualSubtitle}>{RITUAL_STEP_COUNT} étapes · environ 5 min</Text>
      </Pressable>

      <View style={styles.shortcuts}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Ouvrir le journal de ${activeChild.firstName}`}
          onPress={() => router.push('/journal')}
          style={({ pressed }) => [styles.shortcut, pressed && styles.pressed]}
        >
          <BookOpen size={26} color={colors.ink} strokeWidth={1.9} />
          <Text style={styles.shortcutLabel}>Journal</Text>
        </Pressable>
        <View style={styles.shortcutSeparator} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Ouvrir les défis de ${activeChild.firstName}`}
          onPress={() => router.push('/challenges')}
          style={({ pressed }) => [styles.shortcut, pressed && styles.pressed]}
        >
          <Trophy size={26} color={colors.ink} strokeWidth={1.9} />
          <Text style={styles.shortcutLabel}>Défis</Text>
        </Pressable>
      </View>
    </AppShell>
  );
}

/** Titre + accès aux préférences ; le menu disparaît quand la sidebar est là. */
function HomeTopBar() {
  const router = useRouter();
  const inShell = useInShell();

  return (
    <View style={styles.topBar}>
      <Text accessibilityRole="header" style={styles.title}>
        C'est l'heure de Pousse
      </Text>
      {!inShell && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ouvrir les préférences"
          onPress={() => router.push('/settings')}
          style={({ pressed }) => pressed && styles.pressed}
          hitSlop={12}
        >
          <Menu size={24} color={colors.ink} strokeWidth={2} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 34,
    lineHeight: 36,
    color: colors.ink,
    maxWidth: 220,
  },
  pressed: {
    opacity: 0.6,
  },
  childZone: {
    alignItems: 'center',
    gap: 12,
  },
  childName: {
    fontFamily: fonts.heading,
    fontSize: 40,
    lineHeight: 42,
    color: colors.ink,
  },
  ritualCta: {
    backgroundColor: colors.coral,
    borderRadius: 24,
    paddingVertical: 20,
    alignItems: 'center',
    gap: 4,
  },
  ritualTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 18,
    color: colors.ink,
  },
  ritualSubtitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.ink,
    opacity: 0.82,
  },
  shortcuts: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 26,
  },
  shortcut: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  shortcutSeparator: {
    width: 1,
    height: 44,
    backgroundColor: colors.border,
  },
  shortcutLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.ink,
  },
});
