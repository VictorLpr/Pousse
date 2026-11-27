import { Sparkles } from 'lucide-react-native';
import { useEffect, type ReactNode } from 'react';
import { AccessibilityInfo, Platform, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { SketchSprout } from '@/shared/ui/components/sketch-sprout';
import { colors, fonts } from '@/shared/ui/theme';

const BURST_DURATION_MS = 950;
/** The burst spreads wider than tall, like the button it comes out of. */
const BURST_RADIUS_X = 175;
const BURST_RADIUS_Y = 72;
/** Particles start part of the way out, off the button's label. */
const BURST_START = 0.4;
const PARTICLES = [
  { angle: -90, kind: 'sparkle' },
  { angle: -40, kind: 'sprout' },
  { angle: 0, kind: 'sparkle' },
  { angle: 40, kind: 'sprout' },
  { angle: 90, kind: 'sparkle' },
  { angle: 140, kind: 'sprout' },
  { angle: 180, kind: 'sparkle' },
  { angle: 220, kind: 'sprout' },
] as const;

type Particle = (typeof PARTICLES)[number];

interface ChallengeCelebrationProps {
  /** True right after the challenge was marked done on this screen. */
  isCelebrating: boolean;
  /** Read out by screen readers and shown under the button. */
  message: string;
  children: ReactNode;
}

/**
 * Wraps the completion button: it pops and a short burst of sprouts and
 * sparkles comes out of it, then the congratulations message stays below.
 * With reduced motion, only the message.
 */
export function ChallengeCelebration({
  isCelebrating,
  message,
  children,
}: ChallengeCelebrationProps) {
  const reduceMotion = useReducedMotion();
  const animates = isCelebrating && !reduceMotion;
  const pop = useSharedValue(1);

  useEffect(() => {
    if (!animates) return;
    pop.set(
      withSequence(
        withTiming(1.05, { duration: 140, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 260, easing: Easing.inOut(Easing.quad) }),
      ),
    );
  }, [animates, pop]);

  useEffect(() => {
    // iOS ignores live regions: the message has to be announced explicitly.
    if (isCelebrating && Platform.OS === 'ios') {
      AccessibilityInfo.announceForAccessibility(message);
    }
  }, [isCelebrating, message]);

  const popStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.get() }] }));

  return (
    <View>
      <View>
        {/* The button stays mounted through the celebration: it keeps the screen reader's focus. */}
        <Animated.View style={popStyle}>{children}</Animated.View>
        {animates ? <Burst /> : null}
      </View>
      {/* Always mounted: a live region only announces content added to it later. */}
      <View accessibilityLiveRegion="polite">
        {isCelebrating ? <Text style={styles.message}>{message}</Text> : null}
      </View>
    </View>
  );
}

function Burst() {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.set(withTiming(1, { duration: BURST_DURATION_MS, easing: Easing.out(Easing.cubic) }));
  }, [progress]);

  return (
    <View
      aria-hidden
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.burst}
    >
      {PARTICLES.map((particle) => (
        <BurstParticle key={particle.angle} particle={particle} progress={progress} />
      ))}
    </View>
  );
}

function BurstParticle({
  particle,
  progress,
}: {
  particle: Particle;
  progress: SharedValue<number>;
}) {
  const radians = (particle.angle * Math.PI) / 180;
  const dx = Math.cos(radians) * BURST_RADIUS_X;
  const dy = Math.sin(radians) * BURST_RADIUS_Y;

  const style = useAnimatedStyle(() => {
    const value = progress.get();
    const distance = interpolate(value, [0, 1], [BURST_START, 1]);
    return {
      opacity: interpolate(value, [0, 0.15, 0.7, 1], [0, 1, 1, 0]),
      transform: [
        { translateX: dx * distance },
        { translateY: dy * distance },
        { scale: interpolate(value, [0, 0.35, 1], [0.3, 1.15, 0.8]) },
      ],
    };
  });

  return (
    <Animated.View style={[styles.particle, style]}>
      {particle.kind === 'sparkle' ? (
        <Sparkles size={18} color={colors.ink} fill={colors.coral} strokeWidth={1.4} />
      ) : (
        <SketchSprout size={22} color={colors.sageDeep} />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  burst: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
  },
  message: {
    marginTop: 10,
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    lineHeight: 21,
    color: colors.ink,
    textAlign: 'center',
  },
});
