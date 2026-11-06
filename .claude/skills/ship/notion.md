# Notion reference for `/ship`

Everything written in Notion is in French: it is the project-management space
of the PFE. Property and option names below are the exact Notion names.

## Databases

| Database                            | Data source                                         |
| ----------------------------------- | --------------------------------------------------- |
| Backlog (`PFE — Gestion de projet`) | `collection://76bbf8ac-c512-4321-be1a-241ac7957657` |
| Sprints                             | `collection://cd996401-dce0-40c1-b958-95570f43469d` |

Fetch the data source before a SQL query: the `<sqlite-table>` it returns is
the authority on column names (dates expand to `date:Début:start`…).

Finding a ticket: from a URL, fetch it; from a code (`[B1]`, `[L2-3]`,
`[API-5]`…) or a title, query the backlog on `"Tâche" LIKE '%<code>%'`.
The SQL quota runs out after heavy use (about an hour to refill); page fetches
keep working, so fall back to `notion-search` on the code, or to fetching the
epic and walking its `Ticket Epic` list.

## Ticket properties

- `Tâche` (title, prefixed with its code), `Description` (context, acceptance
  criteria, files, dependencies, « parallélisable avec »).
- `Statut`: `À faire` → `En cours` (step 2) → `En revue` (PR open) →
  `Terminé` (PR merged).
- `Priorité` (`Basse`, `Moyenne`, `Haute`), `Tags`, `Effort (pts)`
  (Fibonacci), `Sprint` (relation), `Début`, `Échéance`.
- `Epic` (checkbox) and `Ticket Epic` (self-relation, kept in both
  directions: the epic lists its children, each child points at its epic).

## Delivery section (step 8)

Append to the ticket's page body, not to `Description`:

```markdown
## Livraison

- PR : <url>
- Effort réel : <n> pts (estimé : <n>)
- Preuves : <one line per acceptance criterion>
- Choix et compromis : <decisions taken during the work, or « aucun »>
- Non vérifié : <or « rien »>
- Tickets créés : <links, or « aucun »>
```

## Out-of-scope ticket (step 4)

Create it in the backlog: `Statut` `À faire`, no sprint, same epic as the
current ticket (`Ticket Epic`, both directions), `Tags`, a `Priorité` guess,
and a `Description` with context, acceptance criteria and the files it would
touch. Mention it in the delivery section.

## After merge

1. Set the ticket to `Terminé`.
2. Find the tickets that list it as a dependency; for each one whose
   dependencies are now all `Terminé`, tell the user it is unblocked.
3. If every child of its epic is `Terminé`, tell the user the epic can be
   closed (closing it is their call).
