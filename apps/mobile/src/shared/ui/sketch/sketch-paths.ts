import rough from 'roughjs';
import type { Drawable, Op } from 'roughjs/bin/core';

export type SketchShapeKind = 'rectangle' | 'underline' | 'circle';

export interface SketchStyle {
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  fillStyle?: 'solid' | 'hachure';
  radius?: number;
  roughness?: number;
  /** Dashed stroke for the "locked / add" affordance, instead of a solid one. */
  dashed?: boolean;
}

export interface SketchPath {
  d: string;
  stroke: string;
  strokeWidth: number;
  fill: string;
  dashArray?: string;
}

/** Margin around the shape: the freehand stroke overflows by a few pixels. */
export const SKETCH_OVERFLOW = 4;

const generator = rough.generator();

function roundedRectanglePath(x: number, y: number, width: number, height: number, radius: number) {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  const right = x + width;
  const bottom = y + height;
  return [
    `M ${x + r} ${y}`,
    `L ${right - r} ${y}`,
    `Q ${right} ${y} ${right} ${y + r}`,
    `L ${right} ${bottom - r}`,
    `Q ${right} ${bottom} ${right - r} ${bottom}`,
    `L ${x + r} ${bottom}`,
    `Q ${x} ${bottom} ${x} ${bottom - r}`,
    `L ${x} ${y + r}`,
    `Q ${x} ${y} ${x + r} ${y}`,
    'Z',
  ].join(' ');
}

/**
 * RoughJS draws each segment as an independent subpath (`M … C …`).
 * Since vertices are preserved, they are chained into a single continuous
 * path that fills without gaps.
 */
function outlineFromOps(ops: readonly Op[]): string {
  const commands = ops.map(({ op, data }, index) => {
    if (op === 'bcurveTo') return `C ${data.join(' ')}`;
    return `${op === 'move' && index === 0 ? 'M' : 'L'} ${data.join(' ')}`;
  });
  return commands.join(' ');
}

function dashArrayFor(strokeWidth: number): string {
  return `${(strokeWidth * 1.8).toFixed(1)} ${(strokeWidth * 3.6).toFixed(1)}`;
}

/** Outline + optional fill of a shape already drawn by RoughJS (rectangle or circle). */
function filledOutline(
  outline: Drawable,
  hachure: Drawable | undefined,
  stroke: string,
  strokeWidth: number,
  fillColor: string | undefined,
  isSolid: boolean,
  dashed: boolean,
): SketchPath[] {
  const outlineOps = outline.sets.find((set) => set.type === 'path')?.ops ?? [];
  const shape: SketchPath = {
    d: `${outlineFromOps(outlineOps)} Z`,
    stroke,
    strokeWidth,
    fill: isSolid && fillColor ? fillColor : 'none',
    dashArray: dashed ? dashArrayFor(strokeWidth) : undefined,
  };
  if (isSolid || !fillColor || !hachure) return [shape];

  const hachurePaths = generator.toPaths(hachure).map((path) => ({
    d: path.d,
    stroke: path.stroke,
    strokeWidth: path.strokeWidth,
    fill: path.fill ?? 'none',
  }));
  return [...hachurePaths, shape];
}

/**
 * Computes the SVG paths of a hand-drawn shape for a `width` × `height`
 * box. Coordinates are offset by `SKETCH_OVERFLOW` to leave room for the
 * stroke overflow. Same seed → same drawing.
 */
export function createSketchPaths(
  kind: SketchShapeKind,
  width: number,
  height: number,
  seed: number,
  style: SketchStyle,
): SketchPath[] {
  if (width <= 0 || height <= 0) return [];

  const strokeWidth = style.strokeWidth ?? 1.6;
  const dashed = style.dashed ?? false;
  const options = {
    seed,
    roughness: style.roughness ?? 1.1,
    bowing: 1.4,
    stroke: style.stroke ?? 'none',
    strokeWidth,
    fill: style.fill,
    fillStyle: style.fillStyle ?? 'solid',
    hachureGap: 5,
    hachureAngle: -45,
    fillWeight: 1,
    disableMultiStroke: true,
    preserveVertices: true,
  };

  const inset = SKETCH_OVERFLOW + strokeWidth / 2;
  const stroke = style.stroke ?? 'none';
  const isSolid = options.fillStyle === 'solid';

  if (kind === 'underline') {
    const baseline = SKETCH_OVERFLOW + height - strokeWidth / 2;
    const line = generator.line(
      inset,
      baseline,
      SKETCH_OVERFLOW + width - strokeWidth / 2,
      baseline,
      options,
    );
    return [
      {
        d: outlineFromOps(line.sets[0]?.ops ?? []),
        stroke,
        strokeWidth,
        fill: 'none',
        dashArray: dashed ? dashArrayFor(strokeWidth) : undefined,
      },
    ];
  }

  if (kind === 'circle') {
    const diameter = Math.min(width, height) - strokeWidth;
    if (diameter <= 0) return [];
    const cx = SKETCH_OVERFLOW + width / 2;
    const cy = SKETCH_OVERFLOW + height / 2;
    const outline = generator.circle(cx, cy, diameter, { ...options, fill: undefined });
    const hachure =
      !isSolid && style.fill
        ? generator.circle(cx, cy, diameter, { ...options, stroke: 'none' })
        : undefined;
    return filledOutline(outline, hachure, stroke, strokeWidth, style.fill, isSolid, dashed);
  }

  const rectangle = roundedRectanglePath(
    inset,
    inset,
    width - strokeWidth,
    height - strokeWidth,
    style.radius ?? 0,
  );
  const outline = generator.path(rectangle, { ...options, fill: undefined });
  const hachure =
    !isSolid && style.fill ? generator.path(rectangle, { ...options, stroke: 'none' }) : undefined;
  return filledOutline(outline, hachure, stroke, strokeWidth, style.fill, isSolid, dashed);
}
