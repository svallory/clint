# Working with Worktrees

Clint has first-class support for git worktrees, integrating with [Worktrunk](https://github.com/nicholasgasior/worktrunk) (`wt`) for worktree management.

## What Are Worktrees?

Git worktrees let you check out multiple branches simultaneously, each in its own directory. Instead of switching branches and losing your place, you work on `feat-auth` in one folder and `fix-deploy` in another — at the same time.

This is especially powerful with Claude Code: you can have separate Claude sessions for each worktree, all working in parallel.

## Listing Worktrees

```bash
clint list
```

```
Projects (/Users/you/work)
──────────────────────────────────────────────────
  my-api  (git, 3 worktrees)
    ├─ main *     /Users/you/work/my-api
    ├─ feat-auth  /Users/you/work/my-api.feat-auth
    └─ fix-deploy /Users/you/work/my-api.fix-deploy
  my-frontend  (git)
  clint  (git)
```

For JSON output (useful for scripting):

```bash
clint list --json
```

## Spawning on a Worktree

### Existing worktree

```bash
clint spawn my-api --worktree feat-auth
```

This starts a Claude session in the `feat-auth` worktree directory. The session name becomes `clint-my-api-feat-auth`.

### New worktree

```bash
clint spawn my-api --new-worktree feat-payments
```

This runs `wt switch -c feat-payments` to create the worktree, then starts a Claude session in the new directory.

## How Worktrunk Integrates

Clint uses Worktrunk (`wt`) when available:

| Operation | Clint uses |
|-----------|-----------|
| List worktrees | `wt list --format=json` (falls back to `git worktree list --porcelain`) |
| Create worktree | `wt switch -c <branch>` |
| Find worktree path | Parsed from `wt list` or `git worktree list` output |

### Worktrunk Path Template

Worktrunk uses a configurable template for worktree paths. A common setup (in `~/.config/worktrunk/config.toml`):

```toml
worktree-path = "{{ repo_path }}/../{{ branch | sanitize }}"
```

This creates worktrees as sibling directories. For example, with repo at `~/work/my-api`:

- Branch `feat/auth` → `~/work/my-api.feat-auth`
- Branch `fix/deploy` → `~/work/my-api.fix-deploy`

Clint respects whatever path template Worktrunk is configured with.

## Via Telegram

You can manage worktrees through Telegram by messaging the HQ bot:

> "Spawn my-api on worktree feat-auth"

> "Create a new worktree for my-api called feat-payments and open a session"

## Without Worktrunk

If `wt` is not installed, Clint falls back to native git commands:

- `git worktree list --porcelain` for listing
- For worktree creation, you'll need to create the worktree manually with `git worktree add` first, then use `--worktree` to spawn on it
