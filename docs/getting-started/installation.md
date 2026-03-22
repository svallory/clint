# Installation

## Prerequisites

Before installing Clint, make sure you have:

| Dependency | Version | Purpose |
|-----------|---------|---------|
| [Node.js](https://nodejs.org) or [Bun](https://bun.sh) | Node 18+ / Bun 1.0+ | JavaScript runtime |
| [Claude Code](https://docs.anthropic.com/en/docs/claude-code) | 2.1.51+ | The CLI being managed |
| [tmux](https://github.com/tmux/tmux) | 3.0+ | Session persistence |
| A Claude subscription | Pro/Max/Team/Enterprise | Required for Remote Control |

### Optional

| Dependency | Purpose |
|-----------|---------|
| [Worktrunk](https://github.com/nicholasgasior/worktrunk) (`wt`) | Git worktree management |
| A Telegram bot token | Telegram channel integration |

## Install from npm

A global install is **strongly recommended**. The Clint HQ session (a Claude Code instance) needs to run `clint spawn`, `clint list`, etc. — these only work if `clint` is on your PATH.

```bash
# Global install (recommended)
npm install -g @svallory/clint

# Or with bun
bun install -g @svallory/clint
```

After installing, `clint` is available globally:

```bash
clint --help
```

### Try without installing

You can use `npx` or `bunx` to try Clint without a global install:

```bash
npx @svallory/clint list
bunx @svallory/clint start
```

> **Note:** When running via `bunx`/`npx`, the HQ Claude session won't be able to run `clint` commands (it's not on PATH). Clint will warn you about this and suggest a global install.

## Install from Source

For development or to use the latest unreleased changes:

```bash
git clone https://github.com/svallory/clint.git
cd clint
bun install

# Run in dev mode
bun run dev -- --help
```

## Verify

```bash
clint --help
```

You should see:

```
Claude Code Command Center — calm, decisive, always in control.

USAGE
  $ clint [COMMAND]

COMMANDS
  attach    Attach to a Clint tmux session
  config    Show Clint configuration
  list      List available projects and their worktrees
  spawn     Spawn a new Claude session for a project
  start     Start the Clint HQ session
  status    Show running Clint sessions
  stop      Stop a Clint session
  stop-all  Stop all Clint-managed sessions
```

## Enable Remote Control

Remote Control must be enabled on your Claude account:

- **Pro/Max plans**: Check Settings at claude.ai
- **Team/Enterprise**: An org admin must enable the "Remote Control" toggle in admin settings

Test it:

```bash
claude remote-control --help
```

If you get "Remote Control is not yet enabled for your account", contact your admin or check your subscription.

## Next Steps

- [Configure Clint](/getting-started/configuration) with your projects root and Telegram bot
- [First Run](/getting-started/first-run) — start the HQ session
