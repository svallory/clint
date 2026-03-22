# Clint — UX Improvements Plan

## Context

Clint works end-to-end (`bunx @svallory/clint start` → remote-control session alive), but the user experience has gaps:
1. When run via `bunx`, the HQ Claude session can't easily invoke `clint` commands (not on PATH)
2. The HQ session starts blind — no config summary, no orientation
3. Users don't know where config lives or what's currently configured

This plan addresses 3 UX improvements: global install guidance, a welcome banner, and config visibility.

---

## 1. Suggest global install when running via bunx

**Problem**: When the HQ Claude session tries to run `clint spawn ...`, it fails because `clint` isn't on PATH — the user ran it via `bunx` which doesn't install globally.

**Implementation**:

In `src/commands/start.ts`, after setup and before launching the session, detect if `clint` is on PATH:

```ts
import { spawnSync } from 'node:child_process'

function isClintOnPath(): boolean {
  const result = spawnSync('which', ['clint'], { encoding: 'utf-8' })
  return result.status === 0
}
```

If not on PATH, show a suggestion:

```
Tip: Install Clint globally so the HQ session can manage projects:

  npm install -g @svallory/clint
  # or
  bun install -g @svallory/clint

Running via bunx works, but the HQ Claude session won't be able
to run clint commands without a global install.
```

Use `@clack/prompts` `p.log.warning()` for this — visible but non-blocking.

**File**: `src/commands/start.ts`

---

## 2. Welcome banner in CLAUDE.md

**Problem**: The HQ Claude session starts with no context about what's configured, what projects are available, or what to do.

**Implementation**:

Update `CLAUDE.md` to instruct the HQ session to run `clint list --json` and `clint status --json` on startup and present a summary. But more importantly, generate a **dynamic startup script** that the HQ session runs.

Better approach: instead of relying on CLAUDE.md instructions (which the AI may or may not follow), have `clint start` itself print the welcome banner to the user's terminal. The welcome shows:

```
╔══════════════════════════════════════════════════╗
║  Clint HQ — Claude Code Command Center          ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║  Config:    ~/.config/clint/config.toml          ║
║  Projects:  ~/work (4 projects)                  ║
║  Logs:      ~/.config/clint/logs/                ║
║  Telegram:  disabled                             ║
║                                                  ║
║  Session:   clint-hq (tmux)                      ║
║  Connect:   claude.ai/code → clint-hq            ║
║                                                  ║
║  Commands:                                       ║
║    clint list          List projects              ║
║    clint spawn <name>  Start project session      ║
║    clint status        Show running sessions      ║
║    clint attach        Attach to HQ terminal      ║
║    clint stop-all      Stop everything            ║
║                                                  ║
╚══════════════════════════════════════════════════╝
```

This prints after the session starts successfully (after the `waitAndVerify` check passes).

Also extract the bridge URL from the log and include it in the banner so the user gets a clickable link right in their terminal.

**Files**: `src/commands/start.ts`, `src/utils/banner.ts` (new)

---

## 3. Config visibility via `clint config` command

**Problem**: Users don't know where their config is, what's in it, or how to change it.

**Implementation**:

Add a new `clint config` command that shows the current config:

```
$ clint config

Config file: ~/.config/clint/config.toml

  projects_root   ~/work
  hq.name         clint-hq
  hq.spawn_mode   same-dir
  hq.capacity     32
  claude.mode     default
  telegram        disabled (no hq_bot_token)

Edit: ~/.config/clint/config.toml
Docs: https://clint.saulo.engineer/getting-started/configuration
```

Flags:
- `--json` — output as JSON
- `--path` — just print the config file path (useful for scripting: `$EDITOR $(clint config --path)`)

**File**: `src/commands/config.ts` (new)

---

## Implementation Order

| Step | What | Files |
|------|------|-------|
| 1 | `clint config` command | `src/commands/config.ts` |
| 2 | Welcome banner utility | `src/utils/banner.ts` |
| 3 | Global install detection + banner in `start` | `src/commands/start.ts` |
| 4 | Update CLAUDE.md with config command reference | `CLAUDE.md` |

---

## Verification

1. `bun run dev -- config` → shows config summary
2. `bun run dev -- config --path` → prints just the path
3. `bun run dev -- config --json` → JSON output
4. `bun run dev -- start` (without global install) → shows install suggestion
5. `bun run dev -- start` (with config) → shows welcome banner with projects count, session name, connection info
6. Test in sandbox: `mkdir sandbox/work/proj && CLINT_PROJECTS_ROOT=... bun run dev -- start` → full flow
