import Svg, { Circle, Line, Path } from 'react-native-svg';

import type { EmotionId } from '@/domain/entities/emotion';
import { colors } from '@/ui/theme';

interface EmotionIconProps {
  emotionId: EmotionId;
  size?: number;
  color?: string;
}

/** Visages ligne repris de la maquette (style lucide). */
export function EmotionIcon({ emotionId, size = 26, color = colors.ink }: EmotionIconProps) {
  const strokeProps = {
    stroke: color,
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none' as const,
  };

  return (
    <Svg viewBox="0 0 24 24" width={size} height={size} accessible={false}>
      {emotionId === 'calme' ? (
        <Path d="M12 3a6.4 6.4 0 0 0 9 9 9 9 0 1 1-9-9Z" {...strokeProps} />
      ) : (
        <>
          <Circle cx={12} cy={12} r={10} {...strokeProps} />
          {emotionId === 'joyeux' && (
            <Path d="M18 13a6 6 0 0 1-6 5 6 6 0 0 1-6-5h12Z" {...strokeProps} />
          )}
          {emotionId === 'fier' && <Path d="M8 14s1.5 2 4 2 4-2 4-2" {...strokeProps} />}
          {emotionId === 'surpris' && <Circle cx={12} cy={15} r={1.6} {...strokeProps} />}
          {(emotionId === 'triste' || emotionId === 'fache') && (
            <Path d="M16 16s-1.5-2-4-2-4 2-4 2" {...strokeProps} />
          )}
          {emotionId === 'fache' ? (
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
  );
}
