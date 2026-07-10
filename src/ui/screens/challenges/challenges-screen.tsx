import { Redirect } from 'expo-router';
import { Check, Heart, Lock, PenTool, Star, Trophy as TrophyIcon, Users } from 'lucide-react-native';
import { useEffect, useState, type ComponentType } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Trophy } from '@/domain/entities/trophy';
import type { WeeklyChallenge } from '@/domain/entities/weekly-challenge';
import { useServices } from '@/di/services-provider';
import { OverlineLabel } from '@/ui/components/overline-label';
import { ScreenContainer } from '@/ui/components/screen-container';
import { ScreenHeader } from '@/ui/components/screen-header';
import { useActiveChild } from '@/ui/state/active-child-context';
import { colors, fonts } from '@/ui/theme';

interface TrophyIconProps {
  size?: number | string;
  color?: string;
  strokeWidth?: number;
}

const TROPHY_ICONS: Record<string, ComponentType<TrophyIconProps>> = {
  entraide: Users,
  creatif: PenTool,
  gentillesse: Heart,
  courage: Star,
};

export function ChallengesScreen() {
  const services = useServices();
  const { activeChild, isLoading } = useActiveChild();
  const [challenge, setChallenge] = useState<WeeklyChallenge | null>(null);
  const [trophies, setTrophies] = useState<Trophy[]>([]);

  useEffect(() => {
    if (activeChild) {
      services.getWeeklyChallenge.execute(activeChild.id).then(setChallenge);
      services.getTrophies.execute(activeChild.id).then(setTrophies);
    }
  }, [services, activeChild]);

  if (isLoading) {
    return <ScreenContainer scrollable={false}>{null}</ScreenContainer>;
  }
  if (!activeChild) {
    return <Redirect href="/" />;
  }

  const completeChallenge = async () => {
    setChallenge(await services.completeWeeklyChallenge.execute(activeChild.id));
  };

  const earnedCount = trophies.filter((trophy) => trophy.status === 'earned').length;

  return (
    <ScreenContainer>
      <ScreenHeader title={`Les défis de ${activeChild.firstName}`} />

      {challenge && (
        <View style={styles.challengeCard}>
          <OverlineLabel color={colors.ink} style={styles.challengeOverline}>
            Le défi de la semaine
          </OverlineLabel>
          <Text style={styles.challengeTitle}>{challenge.title}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              challenge.completedTogether ? 'Défi relevé ensemble' : "Marquer le défi comme fait ensemble"
            }
            accessibilityState={{ disabled: challenge.completedTogether }}
            disabled={challenge.completedTogether}
            onPress={completeChallenge}
            style={({ pressed }) => [
              styles.challengeButton,
              challenge.completedTogether && styles.challengeButtonDone,
              pressed && !challenge.completedTogether && styles.pressed,
            ]}>
            <Check size={17} color={colors.ink} strokeWidth={2.4} />
            <Text style={styles.challengeButtonLabel}>
              {challenge.completedTogether ? 'Défi relevé ensemble !' : "On l'a fait ensemble"}
            </Text>
          </Pressable>
        </View>
      )}

      <View style={styles.trophiesHeader}>
        <View style={styles.trophiesTitle}>
          <TrophyIcon size={18} color={colors.ink} strokeWidth={1.9} />
          <Text style={styles.trophiesTitleText}>Mes trophées</Text>
        </View>
        <Text style={styles.trophiesCount}>
          {earnedCount} gagné{earnedCount > 1 ? 's' : ''}
        </Text>
      </View>

      <View style={styles.trophyGrid}>
        {trophies.map((trophy) => {
          const isEarned = trophy.status === 'earned';
          const Icon = TROPHY_ICONS[trophy.id] ?? Lock;
          return (
            <View
              key={trophy.id}
              accessible
              accessibilityLabel={
                isEarned ? `Trophée gagné : ${trophy.name}` : 'Trophée à venir, encore verrouillé'
              }
              style={[styles.trophyCell, isEarned ? styles.earnedTrophy : styles.lockedTrophy]}>
              {isEarned ? (
                <Icon size={24} color={colors.ink} strokeWidth={1.8} />
              ) : (
                <Lock size={24} color={colors.moss} strokeWidth={1.8} />
              )}
              <Text style={[styles.trophyName, !isEarned && styles.lockedTrophyName]}>
                {trophy.name}
              </Text>
            </View>
          );
        })}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  challengeCard: {
    backgroundColor: colors.peach,
    borderRadius: 22,
    padding: 18,
    gap: 12,
    marginBottom: 24,
  },
  challengeOverline: {
    fontSize: 11,
    letterSpacing: 0.9,
  },
  challengeTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 18,
    lineHeight: 24,
    color: colors.ink,
  },
  challengeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.background,
    borderRadius: 14,
    paddingVertical: 12,
  },
  challengeButtonDone: {
    backgroundColor: colors.coral,
  },
  pressed: {
    opacity: 0.8,
  },
  challengeButtonLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.ink,
  },
  trophiesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  trophiesTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trophiesTitleText: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.ink,
  },
  trophiesCount: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.inkSoft,
  },
  trophyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  trophyCell: {
    flexBasis: '30%',
    flexGrow: 1,
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    gap: 8,
  },
  earnedTrophy: {
    backgroundColor: colors.peach,
  },
  lockedTrophy: {
    backgroundColor: colors.background,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.dashedBorder,
  },
  trophyName: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.ink,
  },
  lockedTrophyName: {
    color: colors.moss,
  },
});
