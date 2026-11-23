import { Fragment } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Divider } from '@/shared/ui/components/divider';
import { ScreenContainer } from '@/shared/ui/components/screen-container';
import { ScreenHeader } from '@/shared/ui/components/screen-header';
import { PRIVACY_POLICY_VERSION } from '@/modules/auth/domain/entities/consent';
import {
  PRIVACY_POLICY_INTRO,
  PRIVACY_POLICY_SECTIONS,
  privacyPolicyVersionLabel,
} from '@/modules/auth/ui/format/privacy-policy';
import { colors, fonts } from '@/shared/ui/theme';

/** Readable signed in or not: the sign-up and child-profile screens link here. */
export function PrivacyScreen() {
  return (
    <ScreenContainer>
      <ScreenHeader title="Confidentialité" subtitle="Ce que Pousse garde, et pourquoi" />

      <Text style={styles.intro}>{PRIVACY_POLICY_INTRO}</Text>

      {PRIVACY_POLICY_SECTIONS.map((section) => (
        <Fragment key={section.title}>
          <Divider variant="stitched" spacing={22} />
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            {section.title}
          </Text>
          {section.paragraphs.map((paragraph) => (
            <Text key={paragraph} style={styles.paragraph}>
              {paragraph}
            </Text>
          ))}
          {section.items?.map((item) => (
            <Text key={item.label} style={styles.paragraph}>
              <Text style={styles.itemLabel}>{item.label}</Text> : {item.detail}
            </Text>
          ))}
        </Fragment>
      ))}

      <Divider variant="sprout" spacing={26} />
      <Text style={styles.version}>{privacyPolicyVersionLabel(PRIVACY_POLICY_VERSION)}</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  intro: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: colors.ink,
  },
  sectionTitle: {
    fontFamily: fonts.heading,
    fontSize: 26,
    lineHeight: 30,
    color: colors.ink,
    marginBottom: 8,
  },
  paragraph: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.ink,
    marginBottom: 8,
  },
  itemLabel: {
    fontFamily: fonts.bodySemiBold,
  },
  version: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.inkSoft,
    textAlign: 'center',
  },
});
