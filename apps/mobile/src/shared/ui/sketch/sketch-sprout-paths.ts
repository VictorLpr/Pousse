import rough from 'roughjs';

export interface SketchSproutPath {
  d: string;
  strokeWidth: number;
}

/** Tracés de l'icône lucide « sprout » (viewBox 24×24), repris tels quels. */
const SPROUT_SUBPATHS = [
  'M14 9.536V7a4 4 0 0 1 4-4h1.5a.5.5 0 0 1 .5.5V5a4 4 0 0 1-4 4 4 4 0 0 0-4 4c0 2 1 3 1 5a5 5 0 0 1-1 3',
  'M4 9a5 5 0 0 1 8 4 5 5 0 0 1-8-4',
  'M5 21h14',
];

const generator = rough.generator();

/**
 * Redessine à main levée les tracés de l'icône « sprout » (au lieu de piocher
 * dans `lucide-react-native`). Même graine → même dessin.
 */
export function createSketchSproutPaths(seed: number, strokeWidth = 1.8): SketchSproutPath[] {
  return SPROUT_SUBPATHS.map((subpath) => {
    const drawn = generator.path(subpath, {
      seed,
      roughness: 0.9,
      bowing: 1,
      strokeWidth,
      disableMultiStroke: true,
      preserveVertices: true,
    });
    return { d: generator.opsToPath(drawn.sets[0]), strokeWidth };
  });
}
