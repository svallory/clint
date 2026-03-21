# Clint — TypeScript CLI Implementation Plan

## Context

Clint is an always-running Claude Code command center. It runs as a persistent `claude remote-control` session in tmux, controllable via claude.ai/code and Telegram. It can spawn new Claude sessions for any project, with worktree support via the `wt` (worktrunk) tool.

The current bash script at `bin/clint` will be replaced by a TypeScript CLI built with **oclif v4** and **bun**.

### Key decisions made:
- **Telegram**: Pre-created bot pool. User creates N bots via @BotFather, tokens stored in config. Each project gets a dedicated bot → separate chat.
- **Project discovery**: Direct children of root are projects. Look recursively inside each project for worktrees (via `git worktree list` and `wt list`). Folders can be configured as "groups" to recurse into for nested projects.
- **Session mode**: Every spawned session gets both remote-control + Telegram channel by default.

---

## Phase 1: Scaffold oclif project

### 1.1 — Initialize manually (don't use `oclif generate` — it forces npm)

**Files to create:**

`package.json`:
```jsonc
{
  "name": "clint",
  "version": "0.1.0",
  "description": "Claude Code Command Center",
  "type": "module",
  "bin": { "clint": "./bin/run.js" },
  "oclif": {
    "bin": "clint",
    "dirname": "clint",
    "commands": { "strategy": "pattern", "target": "./dist/commands" },
    "topicSeparator": " "
  },
  "scripts": {
    "dev": "bun ./bin/dev.ts",
    "build": "tsc",
    "test": "bun test"
  },
  "dependencies": {
    "@oclif/core": "^4",
    "smol-toml": "^1"
  },
  "devDependencies": {
    "@types/bun": "latest",
    "typescript": "^5"
  }
}
```

`bin/dev.ts` — `#!/usr/bin/env bun` + oclif execute with `development: true`
`bin/run.js` — `#!/usr/bin/env node` + oclif execute
`tsconfig.json` — ESM, strict, outDir `./dist`, rootDir `./src`

### 1.2 — Update `.gitignore`

Add: `node_modules/`, `dist/`

### 1.3 — Update symlink

`~/.local/bin/clint` → `/Users/svallory/work/clint/bin/dev.ts` (for dev)

### 1.4 — `bun install`

---

## Phase 2: Config system

**File**: `src/config/index.ts`, `src/config/schema.ts`

Config location: `~/.config/clint/config.toml`
Fallback/defaults in code (no default config file shipped).

```toml
projects_root = "~/work"

[hq]
name = "clint-hq"
spawn_mode = "same-dir"    # same-dir | worktree | session
capacity = 32

[claude]
permission_mode = "default"

[telegram]
hq_bot_token = "..."       # REQUIRED for start — throw if missing

[telegram.project_bots]
# project_name = "bot_token"
# myproject = "123:AAA..."

[projects]
# Override behavior for specific directories
# [projects.g2i]
# type = "group"  # recurse into subfolders as separate projects
```

**Rules:**
- `telegram.hq_bot_token` — **must** throw if not set when `clint start` is called
- Expand `~` in paths
- Env var overrides: `CLINT_PROJECTS_ROOT`, `CLINT_HQ_BOT_TOKEN`

---

## Phase 3: Core services

### 3.1 — `src/services/tmux.ts`

Wraps tmux via `Bun.spawnSync()`:
- `sessionExists(name)` → `tmux has-session -t name`
- `createSession({name, cwd, command})` → `tmux new-session -d -s name -c cwd "command"`
- `killSession(name)` → `tmux kill-session -t name`
- `listSessions()` → `tmux list-sessions -F "..."` filtered by `clint-*` prefix
- `attachSession(name)` → `execvp` into `tmux attach -t name`

### 3.2 — `src/services/claude.ts`

Builds the shell command string for launching Claude sessions.

```ts
function buildClaudeCommand(opts: {
  name: string
  spawnMode?: string
  capacity?: number
  permissionMode?: string
  telegramBotToken?: string
  telegramStateDir?: string
  logFile: string
}): string
```

Output format:
```bash
TELEGRAM_BOT_TOKEN=<token> TELEGRAM_STATE_DIR=<dir> claude remote-control \
  --name "<name>" --spawn <mode> --capacity <N> \
  --channels plugin:telegram@claude-plugins-official \
  2>&1 | tee -a <logFile>
```

Note: `--channels` is a top-level `claude` flag but IS accepted by the `remote-control` subcommand based on our testing (`claude --channels <x> remote-control` errors but `claude remote-control` with env vars works). The channels plugin reads from env vars set on the process.

### 3.3 — `src/services/projects.ts`

```ts
interface Project {
  name: string           // e.g. "rcl-tree-sitter" or "g2i/sheets-engine"
  path: string           // absolute path
  isGit: boolean
  hasWorktrees: boolean  // >1 worktree detected
  worktrees: Worktree[]
}

interface Worktree {
  path: string
  branch: string
  isMain: boolean
  isCurrent: boolean
}
```

**Discovery algorithm:**
1. List direct children of `projects_root`
2. For each child:
   - If config marks it as `type = "group"` → recurse, treat its children as projects
   - Otherwise treat it as a single project
3. For each project that has `.git`:
   - Run `git worktree list --porcelain` to get worktrees
   - If `wt` is available (check `which wt`), also try `wt list --format=json` for richer data (branch status, symbols, etc.)
   - If >1 worktree OR main worktree is bare → `hasWorktrees = true`

**Worktree creation:**
- Use `wt switch -c <branch>` (run in project dir). `wt` handles the path template from user config.
- Parse output to get the new worktree path.

### 3.4 — `src/services/telegram.ts`

Manages bot token assignment per session:

```ts
function getSessionTelegramEnv(opts: {
  projectName: string
  config: ClintConfig
}): { TELEGRAM_BOT_TOKEN: string; TELEGRAM_STATE_DIR: string } | null
```

- Looks up `config.telegram.project_bots[projectName]`
- If found: returns token + unique state dir (`~/.config/clint/telegram-state/<projectName>/`)
- If not found: returns null (session runs without dedicated Telegram)
- HQ always uses `config.telegram.hq_bot_token`

---

## Phase 4: Commands

### 4.1 — `src/commands/start.ts`

Starts the HQ session.

Flags: `--name`, `--spawn-mode`, `--permission-mode`, `--capacity`

1. Load config, validate `hq_bot_token` exists
2. Check `tmux.sessionExists()` — bail if running
3. Build command via `buildClaudeCommand()` with HQ bot token
4. `tmux.createSession()` in `/Users/svallory/work/clint`
5. Log connection instructions

### 4.2 — `src/commands/spawn.ts`

Spawns a session for a project.

Args: `PROJECT` (required)
Flags: `--worktree <name>`, `--new-worktree <branch>`, `--permission-mode`, `--name`

1. Resolve project path (name → `projects_root/name`, or absolute path)
2. If `--new-worktree`: run `wt switch -c <branch>` in project dir, get new worktree path
3. If `--worktree`: find worktree path from `wt list --format=json` or `git worktree list`
4. Determine working directory (worktree path or project root)
5. Session name: `clint-<project>` or `clint-<project>-<branch>`
6. Get Telegram env vars (dedicated bot if available)
7. Build command, create tmux session
8. Print connection info

### 4.3 — `src/commands/list.ts`

Flags: `--root`, `--json`

Calls `listProjects()`, displays table:
```
Projects (~/work)
─────────────────
  clint              (git)
  containers
  g2i                (git, 3 worktrees)
    ├─ main          ~/work/g2i
    ├─ feat-auth     ~/work/g2i.feat-auth
    └─ fix-deploy    ~/work/g2i.fix-deploy
  rcl-tree-sitter    (git)
```

### 4.4 — `src/commands/status.ts`

Flags: `--json`

Queries `tmux.listSessions()`, enriches with project info:
```
Clint Sessions
══════════════
  clint-hq            ONLINE   2026-03-21 13:40   (HQ)
  clint-myproject     ONLINE   2026-03-21 14:00   ~/work/myproject
```

### 4.5 — `src/commands/stop.ts`

Args: `SESSION` (optional, defaults to interactive picker if multiple)

### 4.6 — `src/commands/stop-all.ts`

Kills all `clint-*` tmux sessions.

### 4.7 — `src/commands/attach.ts`

Args: `SESSION` (optional, default HQ)

Replaces process with `tmux attach -t <session>`.

---

## Phase 5: CLAUDE.md for HQ session

Update `/Users/svallory/work/clint/CLAUDE.md` so the HQ Claude instance knows:
- On startup: use the Telegram `reply` tool to send "Clint HQ is online" to the paired chat
- When user asks to open a session: run `bin/dev.ts spawn <project> [--worktree X]`
- How to list projects: run `bin/dev.ts list --json`
- How to check status: run `bin/dev.ts status`
- Remind user to check claude.ai/code for the new remote-control session

---

## Implementation order

| Step | What | Files |
|------|------|-------|
| 1 | Scaffold: package.json, tsconfig, bin scripts, bun install | `package.json`, `tsconfig.json`, `bin/dev.ts`, `bin/run.js`, `.gitignore` |
| 2 | Config service | `src/config/schema.ts`, `src/config/index.ts` |
| 3 | tmux service | `src/services/tmux.ts` |
| 4 | Claude CLI builder | `src/services/claude.ts` |
| 5 | `start` command (end-to-end HQ launch) | `src/commands/start.ts` |
| 6 | `status` + `stop` + `stop-all` + `attach` | `src/commands/status.ts`, `stop.ts`, `stop-all.ts`, `attach.ts` |
| 7 | Project discovery service | `src/services/projects.ts` |
| 8 | `list` command | `src/commands/list.ts` |
| 9 | Telegram bot pool service | `src/services/telegram.ts` |
| 10 | `spawn` command | `src/commands/spawn.ts` |
| 11 | Update CLAUDE.md | `CLAUDE.md` |
| 12 | Tests | `test/` |

---

## Verification

1. **Scaffold**: `bun run dev -- --help` shows all commands
2. **Start**: `bun run dev -- start` → tmux session created, verify with `tmux list-sessions | grep clint`
3. **List**: `bun run dev -- list` → shows projects with worktree info matching `git worktree list` output
4. **Spawn**: `bun run dev -- spawn rcl-tree-sitter` → new tmux session, visible in `clint status`
5. **Telegram**: Attach to HQ (`clint attach`), verify QR/pairing shown, send test message from Telegram
6. **Worktree spawn**: `bun run dev -- spawn rcl-tree-sitter --new-worktree feat-test` → `wt switch -c feat-test` runs, session starts in new worktree dir
7. **Cleanup**: `bun run dev -- stop-all` kills all sessions
