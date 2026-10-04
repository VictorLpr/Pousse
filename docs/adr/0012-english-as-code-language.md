# ADR-0012 — English as the code language

- **Status**: Accepted
- **Date**: 2026-10-04

## Context

Until now the code mixed two languages: identifiers were mostly English, but
module names (`defis`, `souvenirs`, `lettres`), database columns (`prenom`,
`nom_famille`), comments, thrown errors and the messages returned by the API
were in French. The project rules even required French for user-facing error
messages, which pushed French text into the API and the business layers.

Mixing languages makes names hard to guess, forces translation layers in odd
places (the API translated BetterAuth's errors into French), and clashes with
every library, framework and tool, all of which speak English.

The product itself targets French-speaking families: what the parent and the
child read on screen must stay in French.

## Decision

**Everything in the codebase is written in English**, with a single exception.

In English:

- identifiers: variables, functions, classes, methods, types, files and
  folders, module names, route paths and query parameters;
- the database: table names, column names, enum and stored code values;
- error messages, whether thrown or returned by the API, and log messages;
- comments and doc comments;
- configuration, CI workflows, scripts and project documentation (AGENTS.md,
  READMEs, handoff notes, data model).

**Exception — the mobile app's UI copy stays in French**: labels, buttons,
headings, accessibility labels and hints, and the display copy derived from
errors. It lives in `apps/mobile/src/**/ui/` (screens, components and
`ui/format/` formatters). Business errors carry an English `code`; the UI maps
the code to its French copy. Content shown to users — demo data seeded in the
in-memory adapters, challenge titles, trophy names — is data, not code, and
stays in French too; its identifiers and keys don't.

ADRs 0001 to 0011 are not translated: an ADR is never edited. This ADR
amends the names they use:

| ADR      | Name in the ADR         | Name in the code          |
| -------- | ----------------------- | ------------------------- |
| ADR-0003 | `prenom`, `nom_famille` | `first_name`, `last_name` |
| ADR-0006 | module `defis`          | module `challenges`       |
| ADR-0006 | module `souvenirs`      | module `memories`         |
| ADR-0006 | module `lettres`        | module `letters`          |

The rest of ADR-0003 and ADR-0006 stays in force.

## Consequences

- The API returns BetterAuth's English messages untouched, plus their stable
  `code`. The mobile client maps codes to French copy, exactly as it does for
  its own business errors.
- The route prefixes change (`/challenges`, `/memories`, `/letters`). No
  client calls them yet, so nothing breaks.
- The data model in `docs/data-model/` uses English entity and attribute
  names, while ADRs 0001 to 0011 keep the French names they were written
  with: a reader has to go through the table above to go from one to the
  other.
- Adding an English-speaking contributor, or switching the UI to another
  language later, no longer requires touching the business layers.
