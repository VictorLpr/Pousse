import { View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import type { EmotionCode } from '@/modules/journal/domain/entities/emotion';
import { colors } from '@/shared/ui/theme';

interface EmotionIconProps {
  emotionCode: EmotionCode;
  size?: number;
  color?: string;
}

/**
 * Line faces taken from the mockup (lucide style). Decorative: the label next
 * to it names the emotion. The wrapper hides it, as `accessible` on the Svg
 * would reach the web DOM as an invalid attribute.
 */
export function EmotionIcon({ emotionCode, size = 26, color = colors.ink }: EmotionIconProps) {
  const strokeProps = {
    stroke: color,
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none' as const,
  };

  return (
    <View aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg viewBox="0 0 24 24" width={size} height={size}>
        {emotionCode === 'calm' ? (
          <Path d="M12 3a6.4 6.4 0 0 0 9 9 9 9 0 1 1-9-9Z" {...strokeProps} />
        ) : (
          <>
            <Circle cx={12} cy={12} r={10} {...strokeProps} />
            {emotionCode === 'happy' && (
              <Path d="M18 13a6 6 0 0 1-6 5 6 6 0 0 1-6-5h12Z" {...strokeProps} />
            )}
            {emotionCode === 'proud' && <Path d="M8 14s1.5 2 4 2 4-2 4-2" {...strokeProps} />}
            {emotionCode === 'surprised' && <Circle cx={12} cy={15} r={1.6} {...strokeProps} />}
            {(emotionCode === 'sad' || emotionCode === 'angry') && (
              <Path d="M16 16s-1.5-2-4-2-4 2-4 2" {...strokeProps} />
            )}
            {emotionCode === 'angry' ? (
              <>
                <Path d="M7.5 8 10 9" {...strokeProps} />
                <Path d="m14 9 2.5-1" {...strokeProps} />
                <Path d="M9 10h.01" {...strokeProps} />
                <Path d="M15 10h.01" {...strokeProps} />
              </>
            ) : (
              <>
                <Line x1={9} x2={9.01} y1={9} y2={9} {...strokeProps} />
                <Line x1={15} x2={15.01} y1={9} y2={9} {...strokeProps} />
              </>
            )}
          </>
        )}
      </Svg>
    </View>
  );
}
