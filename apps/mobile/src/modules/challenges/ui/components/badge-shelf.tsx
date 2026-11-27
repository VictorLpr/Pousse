import { Award, Lock } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { isAwarded, type Badge } from '@/modules/challenges/domain/entities/badge';
import { BadgeIcon } from '@/modules/challenges/ui/components/badge-icon';
import { awardedCountLabel, badgeAccessibilityLabel } from '@/modules/challenges/ui/format/badge';
import { SketchShape } from '@/shared/ui/components/sketch-shape';
import { colors, fonts } from '@/shared/ui/theme';

interface BadgeShelfProps {
  /** The whole catalog, in catalog order: the ones not yet earned are drawn locked. */
  badges: readonly Badge[];
}

/** Every badge of the catalog: the child's earned ones, and the locked ones still to earn. */
export function BadgeShelf({ badges }: BadgeShelfProps) {
  const earnedCount = badges.filter(isAwarded).length;

  return (
    <View>
      <View style={styles.header}>
        <View style={styles.title}>
          <Award size={18} color={colors.ink} strokeWidth={1.9} />
          <Text accessibilityRole="header" style={styles.titleText}>
            Mes badges
          </Text>
        </View>
        <Text style={styles.count}>{awardedCountLabel(earnedCount)}</Text>
      </View>

      <View style={styles.grid}>
        {badges.map((badge) => {
          const isEarned = isAwarded(badge);
          return (
            <View
              key={badge.code}
              accessible
              accessibilityLabel={badgeAccessibilityLabel(badge)}
              style={styles.cell}
            >
              <View style={styles.circle}>
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
                {isEarned ? (
                  <BadgeIcon code={badge.code} />
                ) : (
                  <View>
                    <Lock size={22} color={colors.moss} strokeWidth={1.8} />
                  </View>
                )}
              </View>
              <Text style={[styles.name, !isEarned && styles.lockedName]}>{badge.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleText: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.ink,
  },
  count: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.inkSoft,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 22,
  },
  cell: {
    flexBasis: '33%',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  circle: {
    width: 66,
    height: 66,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    color: colors.ink,
  },
  lockedName: {
    color: colors.moss,
  },
});
