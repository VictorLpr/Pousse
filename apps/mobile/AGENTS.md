# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# Pousse — Rules for agents

Pousse is a parent/child evening-ritual app (React Native + Expo SDK 57, expo-router,
TypeScript strict). Frontend only for now: all data lives in in-memory repositories and an
HTTP API will replace them later. These rules are mandatory for any change.

## 1. Modules by business domain, hexagonal inside each (non-negotiable)

The frontend mirrors the backend's module split (`apps/api`, ADR-0006):
`auth`, `journal`, `defis`, plus two UI-only modules that compose the others
(`souvenirs`, `settings`). Each module with real business logic carries its
own hexagonal layers:

```
src/app  →  src/modules/<name>/ui  →  src/modules/<name>/application  →  src/modules/<name>/domain
                              ↘          src/di  →  src/modules/<name>/infrastructure  →  src/modules/<name>/domain
```

```
src/modules/
  auth/       parent accounts, households, children, session
  journal/    evening ritual, journal entries
  defis/      weekly challenges, trophies (badges live here — they're
              consumed only by this module, mirroring ADR-0006's rule for
              transverse elements)
  souvenirs/  gallery — ui/ only, composes journal's public use-case
  settings/   preferences — ui/ only, composes auth's public use-case
src/shared/   generic code with zero business logic (theme, generic
              components, Clock/IdGenerator ports and their adapters,
              generic formatters, hooks)
```

- `modules/<name>/domain` — entities + ports. **Zero imports from outside
  `domain`.** No React, no Expo, no infrastructure. Entities are immutable
  (`readonly` fields); state changes go through pure helper functions
  (`withIncrementedStreak`, `withReminderEnabled`…).
- `modules/<name>/application/use-cases` — one class per use case,
  constructor-injected ports, a single `execute()` method. Business rules
  live here or in domain helpers — never in screens.
- `modules/<name>/infrastructure` — adapters implementing domain ports
  (`persistence/in-memory/`). May import that module's domain only.
- `modules/<name>/ui` — screens, module-specific components, state, and
  formatters for that module's entities. Talks to the core **only** via
  `useServices()` (never instantiates a repository or use case directly).
- `modules/<name>/index.ts` — the module's **public barrel**: the only thing
  another module's `domain`/`application`/`infrastructure` is allowed to
  import from it (types + use-cases meant for reuse). A `ui` file may import
  another module's `ui/**` directly (screens/state/formatters composing
  across modules is normal — e.g. `settings` reading `auth`'s active-child
  state) — the barrel rule applies to `domain`/`application`/`infrastructure`
  only.
- **A module never imports another module's domain port/entity or
  infrastructure adapter directly, and never touches another module's
  repository.** A service may call another module's use-case (via its
  barrel) exactly like Fastify services do on the backend. Concrete example:
  `auth`'s `CreateChildProfile` used to write directly to `defis`'
  `WeeklyChallengeRepository`/`TrophyRepository` — this was fixed by
  extracting `defis/application/use-cases/initialize-child-progress.ts` and
  having `CreateChildProfile` depend on it through `@/modules/defis` instead.
  Follow the same pattern for any new cross-module need.
- **Documented exception**: `shared/ui/components/app-shell.tsx` is the
  global navigation shell and needs app-wide state to render nav
  guards/badges, so it imports `auth`'s active-child state and `journal`'s
  ritual-draft state directly. This is the one place `shared` is allowed to
  depend on a module — don't extend the exception to other shared files.
- `src/di` — the only place that knows every module (`container.ts`
  composition root, `services-provider.tsx` React context). To connect the
  API later: write HTTP adapters in each module's `infrastructure/` and swap
  them in `container.ts`. Nothing else may change.
- `src/app` — expo-router routes. Route files stay thin: import a screen from
  `src/modules/<name>/ui/screens/**` and default-export it. No logic, no
  styles in route files.

Red flags that must never appear: a screen importing from a module's
`infrastructure`; a module's `domain` importing anything; business logic
(streak math, validation, seeding) inside a component; a use case importing
React; a module's `application`/`infrastructure` reaching into another
module's `domain`/`application`/`infrastructure` by deep path instead of its
barrel.

Side effects behind ports: time via `Clock`, id generation via `IdGenerator`
(both in `src/shared/domain/ports/`, implemented in
`src/shared/infrastructure/`). Never call `new Date()` or build ids inside a
use case.

## 2. Clean code conventions

- File names: kebab-case (`complete-evening-ritual.ts`, `screen-header.tsx`). One
  entity/use case/component per file. Screens end in `-screen.tsx` under
  `src/modules/<name>/ui/screens/<feature>/`.
- Imports use the `@/` alias (maps to `src/`), grouped externals-first, alphabetical.
- TypeScript strict, no `any`, `import type` for type-only imports. Run `npx tsc --noEmit`
  before finishing — it must pass with zero errors.
- Domain and UI language is **French** (labels, error messages, doc comments). Keep
  user-facing copy in the tone of the mockup: warm, simple, child-friendly
  (« Notre moment du soir », « On l'a fait ensemble »).
- Comments only for constraints the code can't express; prefer expressive names.
- Derive display strings through the formatters in `src/shared/ui/format/` (generic, e.g.
  dates) or `src/modules/<name>/ui/format/` (entity-specific, e.g. `auth/ui/format/child.ts`
  for age ranges and streaks) instead of inlining string logic in screens.
- No new dependencies without a strong reason. Icons: `lucide-react-native` (already
  installed); custom SVGs only when the mockup shape has no lucide equivalent (see
  `emotion-icon.tsx`).

## 3. Design system (« Cocon » mockup)

All values come from `src/shared/ui/theme/` — **never hardcode a color or font family in a screen**.

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

Reuse the existing components before creating new ones: `AppButton`, `ScreenHeader`,
`ScreenContainer`, `Avatar`, `ChoiceChip`, `SettingsRow`, `OverlineLabel`, `Divider`,
`ProgressDots` in `src/shared/ui/components/`; `StreakBadge`, `EmotionIcon` in
`src/modules/journal/ui/components/` (they render journal/ritual concepts, not generic
UI). A new generic piece goes in `src/shared/ui/components/`; a piece specific to one
module's entities goes in that module's `ui/components/`. Style with `StyleSheet.create`
(no inline style objects except tiny dynamic values).

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

- Session (parent account + foyer) lives in `useSession()`; the active child in
  `useActiveChild()`. Both are in-memory: a full reload logs the user out — expected.
  Screens behind login guard with `if (!household) return <Redirect href="/" />` (or
  `!activeChild` for child-scoped screens). Children always belong to a household
  (`householdId`); list them via `listChildren.execute(household.id)`.
- Passwords are stored in plain text in the in-memory adapter on purpose (front-only
  demo); hashing (Argon2) arrives with the API. Don't add crypto client-side.
- Screens needing the active child use `useActiveChild()` and must handle **both** states:
  `isLoading` → render an empty `ScreenContainer` (never redirect while loading — this
  broke deep links once), then `!activeChild` → `<Redirect href="/" />`.
- Multi-step flows keep their draft in a context (`useRitualDraft()`), reset it when the
  flow starts, and persist through a use case only at the final step.
- After a use case mutates the active child, refresh the context (`adoptChild(result)`).
- In-memory data resets on full reload — expected until the API lands; don't "fix" it with
  ad-hoc persistence.

## 6. Verify before finishing

1. `npx tsc --noEmit` (run from `apps/mobile`) — must be clean.
2. Launch the web preview (config in `.claude/launch.json` at the repo root, runs
   `expo start --web` inside the `apps/mobile` workspace) and exercise the changed flow
   end-to-end, checking the accessibility tree, not just pixels.
