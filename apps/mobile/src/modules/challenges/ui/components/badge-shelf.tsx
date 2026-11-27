import {
  Award,
  Heart,
  Lock,
  PenTool,
  Star,
  Trophy as TrophyIcon,
  Users,
} from 'lucide-react-native';
import type { ComponentType } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Trophy } from '@/modules/challenges/domain/entities/trophy';
import { SketchShape } from '@/shared/ui/components/sketch-shape';
import { colors, fonts } from '@/shared/ui/theme';

interface TrophyIconProps {
  size?: number | string;
  color?: string;
  strokeWidth?: number;
}

const TROPHY_ICONS: Record<string, ComponentType<TrophyIconProps>> = {
  teamwork: Users,
  creative: PenTool,
  kindness: Heart,
  courage: Star,
};

/** Locked slots drawn after the earned trophies; they are never stored. */
const LOCKED_TROPHY_SLOTS = 2;

interface TrophySlot {
  readonly key: string;
  readonly name: string;
  readonly isEarned: boolean;
  readonly Icon: ComponentType<TrophyIconProps>;
}

interface BadgeShelfProps {
  trophies: readonly Trophy[];
}

/** The child's earned trophies, then the locked slots still to win. */
export function BadgeShelf({ trophies }: BadgeShelfProps) {
  const earnedTrophies = trophies.filter((trophy) => trophy.status === 'earned');
  const earnedCount = earnedTrophies.length;
  const trophySlots: TrophySlot[] = [
    ...earnedTrophies.map((trophy) => ({
      key: trophy.id,
      name: trophy.name,
      isEarned: true,
      Icon: TROPHY_ICONS[trophy.id] ?? Award,
    })),
    ...Array.from({ length: LOCKED_TROPHY_SLOTS }, (_, index) => ({
      key: `locked-slot-${index + 1}`,
      name: 'À venir',
      isEarned: false,
      Icon: Lock,
    })),
  ];

  return (
    <View>
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
        {trophySlots.map(({ key, name, isEarned, Icon }) => (
          <View
            key={key}
            accessible
            accessibilityLabel={
              isEarned ? `Trophée gagné : ${name}` : 'Trophée à venir, encore verrouillé'
            }
            style={styles.trophyCell}
          >
            <View style={styles.trophyCircle}>
              {isEarned ? (
                <SketchShape
                  shape="circle"
                  fill={colors.peach}
                  stroke={colors.ink}
                  strokeWidth={1.6}
                />
              ) : (
                <SketchShape shape="circle" stroke={colors.dashedBorder} strokeWidth={2} dashed />
              )}
              <View>
                <Icon
                  size={isEarned ? 26 : 24}
                  color={isEarned ? colors.ink : colors.moss}
                  strokeWidth={1.8}
                />
              </View>
            </View>
            <Text style={[styles.trophyName, !isEarned && styles.lockedTrophyName]}>{name}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  trophiesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
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
    rowGap: 22,
  },
  trophyCell: {
    flexBasis: '33%',
    alignItems: 'center',
    gap: 8,
  },
  trophyCircle: {
    width: 66,
    height: 66,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trophyName: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.ink,
  },
  lockedTrophyName: {
    color: colors.moss,
  },
});
