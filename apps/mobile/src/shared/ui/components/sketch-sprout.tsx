import { useMemo, useState } from 'react';
import Svg, { Path } from 'react-native-svg';

import { createSketchSproutPaths } from '@/shared/ui/sketch/sketch-sprout-paths';

interface SketchSproutProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/** Icône « sprout » redessinée à main levée (remplace l'icône lucide plate). */
export function SketchSprout({ size = 18, color, strokeWidth = 1.8 }: SketchSproutProps) {
  const [seed] = useState(() => Math.random() * 1_000_000);
  const paths = useMemo(() => createSketchSproutPaths(seed, strokeWidth), [seed, strokeWidth]);

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {paths.map((path, index) => (
        <Path
          key={index}
          d={path.d}
          stroke={color}
          strokeWidth={path.strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </Svg>
  );
}
