import { useEffect } from 'react';
import { AccessibilityInfo, Platform, StyleSheet, Text, View } from 'react-native';

import type { AwardedBadge } from '@/modules/challenges/domain/entities/badge';
import { BadgeIcon } from '@/modules/challenges/ui/components/badge-icon';
import { awardedBadgesMessage } from '@/modules/challenges/ui/format/badge';
import { colors, fonts } from '@/shared/ui/theme';

interface AwardedBadgesNoticeProps {
  /** The badges an action just earned, as its `awardedBadges`; nothing is shown when empty. */
  badges: readonly Pick<AwardedBadge, 'code' | 'label'>[];
}

/**
 * Tells the child which badges they just earned, on a screen that opens with
 * them. On the web, an `alert` inserted with the screen is read out; native
 * screen readers don't announce a live region that mounts already filled, so
 * the message is announced explicitly there.
 */
export function AwardedBadgesNotice({ badges }: AwardedBadgesNoticeProps) {
  const message = awardedBadgesMessage(badges);

  useEffect(() => {
    if (message && Platform.OS !== 'web') {
      AccessibilityInfo.announceForAccessibility(message);
    }
  }, [message]);

  if (!message) return null;
  return (
    <View accessible accessibilityRole="alert" accessibilityLabel={message} style={styles.row}>
      <View style={styles.icons}>
        {badges.map((badge) => (
          <BadgeIcon key={badge.code} code={badge.code} size={24} />
        ))}
      </View>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    maxWidth: 320,
  },
  icons: {
    flexDirection: 'row',
    gap: 4,
  },
  message: {
    flexShrink: 1,
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    lineHeight: 21,
    color: colors.ink,
  },
});
