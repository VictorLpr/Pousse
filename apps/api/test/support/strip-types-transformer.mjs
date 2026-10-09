import { stripTypeScriptTypes } from 'node:module';

/**
 * Jest transformer relying on Node's built-in type stripping: types are
 * replaced by whitespace, so line and column numbers stay those of the
 * source and no source map is needed. Only erasable syntax is supported
 * (`erasableSyntaxOnly` in `tsconfig.json`); `npm run typecheck` checks the
 * types themselves.
 *
 * @type {import('@jest/transform').SyncTransformer}
 */
export default {
  process(sourceText) {
    return { code: stripTypeScriptTypes(sourceText, { mode: 'strip' }) };
  },
};
