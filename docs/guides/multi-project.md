# Multi-Project Workflow

Clint is designed to manage Claude Code sessions across many projects simultaneously. Here's how to use it effectively.

## The HQ Pattern

The core pattern is:

1. **Clint HQ** runs permanently — it's your command center
2. **Project sessions** are spawned on demand, each in their own tmux session
3. All sessions are reachable via **claude.ai/code** and optionally **Telegram**

```
clint-hq (always on)
    |
    +-- clint-my-api         (spawned for ~/work/my-api)
    +-- clint-my-frontend    (spawned for ~/work/my-frontend)
    +-- clint-my-api-fix-bug (spawned for worktree)
```

## Day-to-Day Workflow

### Morning: Start HQ

```bash
clint start
```

Or if it's already running, verify:

```bash
clint status
```

### Spawn Sessions as Needed

From terminal:
```bash
clint spawn my-api
clint spawn my-frontend --new-worktree feat-redesign
```

From Telegram:
> "Open sessions for my-api and my-frontend"

From claude.ai/code:
Connect to the HQ session and ask Clint to spawn what you need.

### Work Across Projects

Each session at claude.ai/code is independent. You can:

- Have `my-api` working on a backend feature
- Have `my-frontend` implementing the UI for it
- Ask the HQ session to coordinate between them

### End of Day

```bash
# Stop specific sessions
clint stop my-frontend

# Or stop everything
clint stop-all
```

## Project Groups

If you have a monorepo or org folder with multiple repos inside:

```
~/work/my-org/
├── service-a/
├── service-b/
└── shared-lib/
```

Configure it as a group:

```toml
[projects.my-org]
type = "group"
```

Now `clint list` shows:

```
  my-org/service-a    (git)
  my-org/service-b    (git)
  my-org/shared-lib   (git)
```

And you can spawn sessions for them:

```bash
clint spawn my-org/service-a
```

## Session Naming

Sessions follow a predictable naming convention:

| Scenario | Session name |
|----------|-------------|
| HQ | `clint-hq` |
| Project | `clint-<project>` |
| Worktree | `clint-<project>-<branch>` |
| Custom | Whatever you pass with `--name` |

This makes it easy to find sessions in `tmux`, `clint status`, and claude.ai/code.

## Capacity

By default, Remote Control allows 32 concurrent sessions. Adjust in config:

```toml
[hq]
capacity = 16
```

Or per-start:

```bash
clint start --capacity 64
```
