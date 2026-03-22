# Command Reference

## `clint start`

Start the Clint HQ session.

```
USAGE
  $ clint start [FLAGS]

FLAGS
  --name=<name>              Session name (default: clint-hq)
  --spawn-mode=<mode>        same-dir | worktree | session (default: same-dir)
  --permission-mode=<mode>   default | acceptEdits | plan | auto
  --capacity=<N>             Max concurrent sessions (default: 32)
```

Launches a `claude remote-control` server in a tmux session. Telegram channels are enabled if a bot token is configured. On first run, an interactive setup wizard guides you through configuration.

On successful start, displays a welcome banner with config summary, project count, connection URL, and key commands. If `clint` is not installed globally (running via `bunx`), shows a warning suggesting global install.

**Examples:**
```bash
clint start
clint start --spawn-mode worktree
clint start --capacity 16 --permission-mode acceptEdits
```

---

## `clint spawn`

Spawn a new Claude session for a project.

```
USAGE
  $ clint spawn PROJECT [FLAGS]

ARGUMENTS
  PROJECT    Project name (under projects root) or absolute path

FLAGS
  --worktree=<name>          Use an existing worktree (branch name)
  --new-worktree=<branch>    Create a new worktree via wt switch -c
  --permission-mode=<mode>   default | acceptEdits | plan | auto
  --name=<name>              Custom session name
```

Creates a tmux session running `claude remote-control` for the specified project. If the project has a dedicated Telegram bot configured, it's automatically enabled.

**Examples:**
```bash
clint spawn my-project
clint spawn my-project --worktree feat-auth
clint spawn my-project --new-worktree feat-login
clint spawn /absolute/path/to/project
clint spawn my-project --name custom-session-name
```

---

## `clint list`

List available projects and their worktrees.

```
USAGE
  $ clint list [FLAGS]

FLAGS
  --root=<path>    Override projects root directory
  --json           Output as JSON
```

Scans the projects root for directories, detects git repos and worktrees. Uses `wt list --format=json` when Worktrunk is available, falls back to `git worktree list --porcelain`.

**Examples:**
```bash
clint list
clint list --json
clint list --root /path/to/other/projects
```

**Output:**
```
Projects (/Users/you/work)
──────────────────────────────────────────────────
  clint              (git)
  my-api             (git, 3 worktrees)
    ├─ main *        /Users/you/work/my-api
    ├─ feat-auth     /Users/you/work/my-api.feat-auth
    └─ fix-deploy    /Users/you/work/my-api.fix-deploy
  my-frontend        (git)
```

---

## `clint status`

Show running Clint sessions.

```
USAGE
  $ clint status [FLAGS]

FLAGS
  --json    Output as JSON
```

Queries tmux for all sessions with the `clint` prefix.

**Examples:**
```bash
clint status
clint status --json
```

**Output:**
```
Clint Sessions
══════════════
  clint-hq            ONLINE     Sat Mar 21 14:00:00 2026  (HQ)
  clint-my-api        ONLINE     Sat Mar 21 14:05:00 2026
  clint-my-api-auth   ATTACHED   Sat Mar 21 14:10:00 2026
```

---

## `clint stop`

Stop a Clint session.

```
USAGE
  $ clint stop [SESSION]

ARGUMENTS
  SESSION    Session name or project name (default: clint-hq)
```

Kills the tmux session. Accepts either the full session name (`clint-my-project`) or just the project name (`my-project`).

**Examples:**
```bash
clint stop              # Stops clint-hq
clint stop my-project   # Stops clint-my-project
```

---

## `clint stop-all`

Stop all Clint-managed sessions.

```
USAGE
  $ clint stop-all
```

Kills every tmux session with the `clint` prefix, including HQ.

---

## `clint attach`

Attach to a Clint tmux session.

```
USAGE
  $ clint attach [SESSION]

ARGUMENTS
  SESSION    Session name or project name (default: clint-hq)
```

Attaches your terminal to the tmux session. Useful for seeing the initial QR code or debugging. Press `Ctrl+B, D` to detach without stopping the session.

**Examples:**
```bash
clint attach              # Attach to HQ
clint attach my-project   # Attach to clint-my-project
```

---

## `clint config`

Show Clint configuration.

```
USAGE
  $ clint config [FLAGS]

FLAGS
  --json    Output as JSON
  --path    Print config file path only
```

Displays the current configuration including projects root, HQ settings, Telegram status, and project bot/group counts. Also shows the config file path and a link to the documentation.

**Examples:**
```bash
clint config                           # Show config summary
clint config --json                    # Output as JSON
clint config --path                    # Just print the file path
$EDITOR $(clint config --path)         # Open config in your editor
```

**Output:**
```
Config file: ~/.config/clint/config.toml

  projects_root     ~/work
  hq.name           clint-hq
  hq.spawn_mode     same-dir
  hq.capacity       32
  claude.mode       default
  telegram          disabled
  project bots      none
  project groups    none

Edit: ~/.config/clint/config.toml
Docs: https://clint.saulo.engineer/getting-started/configuration
```
