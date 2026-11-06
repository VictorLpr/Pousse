# Removing a merged worktree

Run from the main checkout, never from inside the worktree, once its session
is archived and its PR merged. Worktrees live in `.claude/worktrees/<name>`.

Recursive deletion follows links on Windows: a junction or workspace symlink
inside the worktree that points elsewhere gets its target emptied. That is how
a test once emptied the main checkout's `apps/api/node_modules`. So links go
first, one by one, as links.

1. List the links left in the folder (PowerShell):
   `Get-ChildItem "<worktree>" -Recurse -Force -Attributes ReparsePoint`.
   npm workspaces put two in `node_modules/@pousse/`. Remove each link itself
   with `cmd /c rmdir "<link>"`, which never touches the target. Done when the
   listing comes back empty.
2. Unregister and delete: `git worktree remove --force "<worktree>"`, then
   `git worktree prune`.
3. Paths past 260 characters survive step 2. Delete the leftovers with
   `Remove-Item -LiteralPath "\\?\<absolute worktree path>" -Recurse -Force`,
   the path written out in full.
4. Check that the main checkout is intact: `node_modules` and
   `apps/api/node_modules` still populated, `npm run typecheck` green.

Done when `git worktree list` no longer shows it and the folder is gone.
