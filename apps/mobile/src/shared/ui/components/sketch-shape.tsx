import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import {
  createSketchPaths,
  SKETCH_OVERFLOW,
  type SketchShapeKind,
  type SketchStyle,
} from '@/shared/ui/sketch/sketch-paths';

interface SketchShapeProps extends SketchStyle {
  shape: SketchShapeKind;
  /**
   * Offsets the seed drawn at mount (e.g. +1 on click) to make the stroke
   * "quiver" on interaction, without losing stability across renders.
   */
  seedOffset?: number;
}

/**
 * "Hand-drawn" shape (RoughJS) laid behind its parent, which must be
 * positioned. Purely decorative: invisible to accessibility and touch.
 * Each instance draws its own seed at mount, stable afterwards.
 */
export function SketchShape({
  shape,
  seedOffset = 0,
  stroke,
  strokeWidth,
  fill,
  fillStyle,
  radius,
  roughness,
  dashed,
}: SketchShapeProps) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [baseSeed] = useState(() => Math.random() * 1_000_000);
  const seed = baseSeed + seedOffset;

  const onLayout = ({ nativeEvent }: LayoutChangeEvent) => {
    const width = Math.round(nativeEvent.layout.width);
    const height = Math.round(nativeEvent.layout.height);
    setSize((current) =>
      current.width === width && current.height === height ? current : { width, height },
    );
  };

  const paths = useMemo(
    () =>
      createSketchPaths(shape, size.width, size.height, seed, {
        stroke,
        strokeWidth,
        fill,
        fillStyle,
        radius,
        roughness,
        dashed,
      }),
    [
      shape,
      size.width,
      size.height,
      seed,
      stroke,
      strokeWidth,
      fill,
      fillStyle,
      radius,
      roughness,
      dashed,
    ],
  );

  return (
    <View
      onLayout={onLayout}
      pointerEvents="none"
      aria-hidden
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={StyleSheet.absoluteFill}
    >
      {paths.length > 0 ? (
        <Svg
          width={size.width + SKETCH_OVERFLOW * 2}
          height={size.height + SKETCH_OVERFLOW * 2}
          style={styles.canvas}
        >
          {paths.map((path, index) => (
            <Path
              key={index}
              d={path.d}
              stroke={path.stroke}
              strokeWidth={path.strokeWidth}
              strokeDasharray={path.dashArray}
              fill={path.fill}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </Svg>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    position: 'absolute',
    top: -SKETCH_OVERFLOW,
    left: -SKETCH_OVERFLOW,
  },
});
