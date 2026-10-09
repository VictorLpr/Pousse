# Pousse — mobile client

Mobile app (React Native + Expo) built from the "Cocon" mockup.

## Running the project

From the monorepo root:

```bash
npm install
npm run mobile:web   # or npm run mobile, then pick Android / iOS / web
```

## Architecture: business modules, hexagonal inside each

The code enforces a strict ports / adapters split, inside modules organized
by business domain — mirroring the API's split (`apps/api`, ADR-0006). Full
details in [AGENTS.md](AGENTS.md).

```
src/
├── modules/
│   ├── auth/         # parent accounts, households, children, session
│   ├── journal/      # evening ritual, journal entries
│   ├── challenges/   # weekly challenges, trophies
│   ├── memories/     # photo gallery (ui/ only, consumes journal)
│   └── settings/     # preferences (ui/ only, consumes auth)
│       each business module carries domain/ application/ infrastructure/ ui/
├── shared/           # theme, generic components, Clock/IdGenerator
├── di/               # composition root (container) + React provider
└── app/              # expo-router routes (thin files pointing to ui/screens)
```

**Wiring the API later**: implement the ports of each
`modules/<name>/domain/ports/` with HTTP adapters in
`modules/<name>/infrastructure/`, then swap them in `src/di/container.ts`.
Nothing else changes.

## Screens

- Onboarding: welcome, sign-up (email + password), household creation, child profile
- Sign-in: email + password (demo account: `parent@demo.fr` / `pousse123`)
- Household: home page listing the household's children, picking tonight's child
- Child home: evening streak, starting the ritual
- Evening ritual (4 steps): emotion → pride → photo → recap, then a "Bravo" screen
- Memory journal, challenges & trophies, gallery
- Settings (reminder, sign-out) and switching child from the household page

The UI copy itself is in French (the app targets French-speaking families);
everything else — code, comments, errors — is in English.

## Accessibility

Every interactive element has `accessibilityRole`, `accessibilityLabel` and,
when useful, `accessibilityState` / `accessibilityHint` (selections, disabled
states). Choice groups use `radiogroup` / `radio`, titles `header`, the ritual
progress `progressbar`.
