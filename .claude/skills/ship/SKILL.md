---
name: ship
description: Deliver one Pousse backlog ticket from Notion end to end — readiness check, worktree, plan approved by the user, implementation, review, PR, ticket updates. Use when asked to ship, implement or deliver a ticket (`/ship <ticket>`).
argument-hint: <Notion ticket URL, code like [B1], or title>
---

# Ship a ticket

One ticket, one branch, one PR. The ticket is the contract: its acceptance
criteria decide what is in scope, and every criterion ends the run with a
**proof** (a test, a command output, a screenshot or an accessibility-tree
read). The user approves the plan before any code changes; everything else
runs on its own.

Notion is reached through the Notion MCP tools; ids, properties, statuses and
the French page templates are in [notion.md](notion.md). Code, commits and the
PR are in English (root `AGENTS.md`); what you write in Notion and every
message to the user (plan, questions, reports) is in French.

## 1. Read the ticket

Resolve `$ARGUMENTS` to a ticket page of the backlog and fetch it: properties,
description, its epic (`Ticket Epic`), its sprint. Then read the root
`AGENTS.md`, the `AGENTS.md` of every app the ticket touches, and each ADR the
ticket or those files point at for this area.

The ticket is **ready** when all three hold:

- every ticket listed under its dependencies is `Terminé`, or its PR is merged
  into `main` (`gh pr list --state merged --search "<code>"`);
- it has acceptance criteria you can turn into proofs;
- no « décision à confirmer » is left open in it.

Not ready → stop here: tell the user what is missing and ask. Done when the
ticket is ready and you can name every file the description lists.

## 2. Set up the workspace

- Already in a git worktree (`git rev-parse --git-dir` differs from
  `git rev-parse --git-common-dir`): work there, on the branch it came with.
- Otherwise: enter a new worktree with `EnterWorktree`, named
  `<type>-<code>-<slug>` (e.g. `fix-b1-trophy-icons`).

Bring the branch up to date with `main` (`sync_with_base_branch` when the
tool is available, else `git fetch origin && git merge origin/main`). A fresh
worktree has no `node_modules`: start `npm ci --prefer-offline` in the
background now and carry on with step 3 while it runs. Give each worktree its
own install, a real directory: a link to the main checkout's `node_modules`
gets emptied when the worktree is removed. Ticket touching `apps/api`: check
`docker info` now and tell the user at once if Docker is down. Then set the
ticket to `En cours`.

## 3. Plan, then wait

Write the plan:

- each acceptance criterion → the change that meets it → the proof you will
  show;
- the files you will touch, matched against the ticket's file list (a
  parallel session may own the others);
- tests you will add (`apps/api`: integration tests per ADR-0007;
  `apps/mobile` has no test runner: typecheck plus a preview walkthrough);
- flags, each one either "none" or explained: API contract change, Drizzle
  migration, new dependency (needs a strong reason), ADR to write (an ADR is
  superseded, never edited), `AGENTS.md` / `docs/data-model` to update;
- what is explicitly out of scope.

Present it with `ExitPlanMode` (enter plan mode first if needed) and wait.
Done when the user has approved it in chat; their changes go into the plan
before you start.

## 4. Implement

Follow the plan, matching the surrounding code. Change files with the `Edit`
and `Write` tools: each one is reviewed as a diff, where a script that
rewrites files stops for the user's approval. Work found along the way that
the ticket does not ask for becomes a new backlog ticket ([notion.md](notion.md)),
never part of this branch. If the plan turns out wrong in a way that changes
scope, files or flags, go back to the user with the revised plan.

Commit in small steps, Conventional Commits with a scope, as in `git log`,
every subject ending with the ticket code: `fix(mobile): show earned trophy
icons [B1]`. A one-commit PR is squashed under its commit subject, so the code
reaches `main` only through it. Done when every planned change is in.

## 5. Prove it

- Run, from the repo root, every command of the job in
  `.github/workflows/ci.yml`; all green. Judge `format:check` on committed
  files only: the user's untracked files (e.g. `.claude/skills/`) fail it
  and are none of your business. A new drizzle-kit migration folder needs
  `oxfmt --write` (its `snapshot.json` is not formatted).
- `apps/api` touched: `npm test -w apps/api` (Docker must be running; if it
  is not, say so instead of skipping silently).
- `apps/mobile` touched: start the `pousse-web` preview and walk the changed
  flow end to end, reading the accessibility tree, as `apps/mobile/AGENTS.md`
  §6 asks.

Done when every acceptance criterion has its proof in hand.

## 6. Review

Run the `code-review` skill on the branch diff against `main`, then go through
[review-checklist.md](review-checklist.md) rule by rule. Fix what holds up,
re-run step 5 for what the fixes touched. Done when no confirmed finding is
left and every checklist rule was applied.

## 7. Open the PR

Push the branch and open the PR with `gh pr create`, body from
[pr-template.md](pr-template.md). Then read its CI and offer Auto-fix.

Sibling sessions merge their PRs while yours waits. After every push, and
whenever you hear that another PR was merged, read
`gh pr view --json mergeable`: on `CONFLICTING`, bring the branch up to date
with `main` as in step 2, resolve, re-run step 5 for what moved, and push.
Done when the PR is `MERGEABLE` with its CI green.

Two
GitHub workflows are manual and cost quota or need approval: the Claude review
(comment `/review` on the PR) and the staging deploy. Mention them to the
user; trigger them only when asked.

## 8. Update Notion and report

Set the ticket to `En revue` and add the delivery section to its page
([notion.md](notion.md)). Then give the user a short report: PR link, proofs,
what was not verified, tickets created. The ticket becomes `Terminé` only once
its PR is merged, which is the user's call. When they tell you it is merged:
apply the "after merge" steps of [notion.md](notion.md), report them, then
stop what you started (preview server, containers) and archive this session
(`archive_session` with `self`). The user wants merged worktrees gone, and
archiving only detaches them: on Windows the folder stays behind, held by its
deep `node_modules`. Before archiving, tell the session that started you (or
the user) that the folder is ready for [cleanup.md](cleanup.md).
