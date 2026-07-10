# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# Pousse — Rules for agents

Pousse is a parent/child evening-ritual app (React Native + Expo SDK 57, expo-router,
TypeScript strict). Frontend only for now: all data lives in in-memory repositories and an
HTTP API will replace them later. These rules are mandatory for any change.

## 1. Hexagonal architecture (non-negotiable)

Layers and the only allowed dependency directions:

```
src/app  →  src/ui  →  src/application  →  src/domain
                 ↘        src/di  →  src/infrastructure  →  src/domain
```

- `src/domain` — entities + ports (interfaces). **Zero imports from outside `src/domain`.**
  No React, no Expo, no infrastructure. Entities are immutable (`readonly` fields); state
  changes go through pure helper functions (`withIncrementedStreak`, `withReminderEnabled`…).
- `src/application/use-cases` — one class per use case, constructor-injected ports,
  a single `execute()` method. Business rules live here or in domain helpers — never in
  screens. May import domain only.
- `src/infrastructure` — adapters implementing domain ports (`persistence/in-memory/`,
  `ids/`, `time/`). May import domain only.
- `src/di` — the only place where use cases meet adapters (`container.ts` composition root,
  `services-provider.tsx` React context). To connect the API later: write HTTP adapters in
  `src/infrastructure` and swap them in `container.ts`. Nothing else may change.
- `src/ui` — screens, components, theme, formatters, React state. Talks to the core **only**
  via `useServices()` (never instantiates a repository or use case directly).
- `src/app` — expo-router routes. Route files stay thin: import a screen from
  `src/ui/screens/**` and default-export it. No logic, no styles in route files.

Red flags that must never appear: a screen importing from `src/infrastructure`;
`src/domain` importing anything; business logic (streak math, validation, seeding) inside a
component; a use case importing React.

Side effects behind ports: time via `Clock`, id generation via `IdGenerator`. Never call
`new Date()` or build ids inside a use case.

## 2. Clean code conventions

- File names: kebab-case (`complete-evening-ritual.ts`, `screen-header.tsx`). One
  entity/use case/component per file. Screens end in `-screen.tsx` under
  `src/ui/screens/<feature>/`.
- Imports use the `@/` alias (maps to `src/`), grouped externals-first, alphabetical.
- TypeScript strict, no `any`, `import type` for type-only imports. Run `npx tsc --noEmit`
  before finishing — it must pass with zero errors.
- Domain and UI language is **French** (labels, error messages, doc comments). Keep
  user-facing copy in the tone of the mockup: warm, simple, child-friendly
  (« Notre moment du soir », « On l'a fait ensemble »).
- Comments only for constraints the code can't express; prefer expressive names.
- Derive display strings through the formatters in `src/ui/format/` (dates, age ranges,
  streaks) instead of inlining string logic in screens.
- No new dependencies without a strong reason. Icons: `lucide-react-native` (already
  installed); custom SVGs only when the mockup shape has no lucide equivalent (see
  `emotion-icon.tsx`).

## 3. Design system (« Cocon » mockup)

All values come from `src/ui/theme/` — **never hardcode a color or font family in a screen**.

Palette (`colors`): `background #FEF4EB` (crème), `coral #FFB089` (CTA uniquement, jamais
couleur de texte), `peach #FFDAC4` (accents/sélection), `ink #2E4449` (texte principal),
`inkSoft #4E6B73` (texte secondaire), `border/sage #DEE0D0`, `sageDeep #9DA986`,
`overline #7C8F84`, `dashedBorder #B7BCA2`, `moss #5E7168`, `surface #FFFFFF`.

Typography (`fonts`): Caveat 700 for headings/prénoms (`heading`), Quicksand 500/600/700
for body (`body`, `bodySemiBold`, `bodyBold`). Fonts load in `src/app/_layout.tsx`.

**Layout philosophy — « carnet du soir » (flat & editorial). No boxes-in-boxes:**

- Screens are open pages on the cream background. Avoid bordered cards and nested
  containers; content sits directly on the page, structured by typography and whitespace.
- Sections and list rows are separated by the `Divider` component (`hairline` filet,
  `stitched` pointillé « couture », `sprout` ornament with the little plant), never by
  wrapping each item in its own bordered box.
- At most **one** filled accent surface per screen (a coral CTA pill or a peach block) —
  if a screen already has one, everything else stays flat.
- Icons are drawn bare (no circle/pastille behind them). A peach circle appears only to
  mark a **selected** state (e.g. emotion choice) or an avatar/trophy.
- Inputs are underlined (2px `border` bottom), not boxed. Selectable chips are underlined
  with a 3px coral bar when selected (`ChoiceChip`).
- Quotes/prompts use a 3px coral left bar (see pride step), not a tinted box.
- Dashed `dashedBorder` + `moss` text remain the language for "locked/add" affordances.
- Ritual steps use `RitualStepLayout`: open cream page, `ProgressDots`, large Caveat title.
- Lean on Caveat for personality: headings, first names, emotion words in the journal.

Reuse the existing components in `src/ui/components/` (`AppButton`, `ScreenHeader`,
`ScreenContainer`, `Avatar`, `StreakBadge`, `ChoiceChip`, `SettingsRow`, `OverlineLabel`,
`EmotionIcon`, `Divider`, `ProgressDots`) before creating new ones. New reusable pieces go
in `src/ui/components/`, styled with `StyleSheet.create` (no inline style objects except
tiny dynamic values).

## 4. Accessibility (required on every interactive element)

- Every `Pressable` gets `accessibilityRole="button"` + a French `accessibilityLabel`
  describing the action (« Ouvrir le journal de Léa »), plus `accessibilityHint` when the
  outcome isn't obvious.
- Selections: container `accessibilityRole="radiogroup"`, items `radio` with
  `accessibilityState={{ selected }}`. Disabled buttons expose
  `accessibilityState={{ disabled }}`.
- Titles are `accessibilityRole="header"`; progress indicators `progressbar` with a label
  like « Étape 2 sur 4 »; informative non-text blocks get `accessible` + a label; purely
  decorative icons are hidden from the tree.
- `TextInput` always has an `accessibilityLabel`.

## 5. Screen patterns & pitfalls

- Screens needing the active child use `useActiveChild()` and must handle **both** states:
  `isLoading` → render an empty `ScreenContainer` (never redirect while loading — this
  broke deep links once), then `!activeChild` → `<Redirect href="/" />`.
- Multi-step flows keep their draft in a context (`useRitualDraft()`), reset it when the
  flow starts, and persist through a use case only at the final step.
- After a use case mutates the active child, refresh the context (`adoptChild(result)`).
- In-memory data resets on full reload — expected until the API lands; don't "fix" it with
  ad-hoc persistence.

## 6. Verify before finishing

1. `npx tsc --noEmit` — must be clean.
2. Launch the web preview (`npx expo start --web`, config in `.claude/launch.json`) and
   exercise the changed flow end-to-end, checking the accessibility tree, not just pixels.
