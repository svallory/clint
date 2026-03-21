# Configuration

Clint uses a TOML configuration file at `~/.config/clint/config.toml`.

## Create the Config

```bash
mkdir -p ~/.config/clint
```

Create `~/.config/clint/config.toml`:

```toml
projects_root = "~/work"

[hq]
name = "clint-hq"
spawn_mode = "same-dir"
capacity = 32

[claude]
permission_mode = "default"

[telegram]
hq_bot_token = "YOUR_HQ_BOT_TOKEN"

[telegram.project_bots]
# my-project = "DEDICATED_BOT_TOKEN"

# [projects.my-monorepo]
# type = "group"
```

## Options Reference

### Top-level

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `projects_root` | string | `~/work` | Root directory containing your projects |

### `[hq]` — HQ Session

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `name` | string | `clint-hq` | tmux session name for HQ |
| `spawn_mode` | string | `same-dir` | How Remote Control spawns sessions: `same-dir`, `worktree`, or `session` |
| `capacity` | integer | `32` | Max concurrent Remote Control sessions |

### `[claude]` — Claude Code Defaults

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `permission_mode` | string | `default` | Permission mode: `default`, `acceptEdits`, `plan`, `auto` |

### `[telegram]` — Telegram Bots

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `hq_bot_token` | string | *required* | Bot token for the HQ session |

### `[telegram.project_bots]` — Per-Project Bots

Key-value pairs mapping project names to Telegram bot tokens:

```toml
[telegram.project_bots]
my-api = "123456789:AABBCCDDEEFFaabbccdd"
my-frontend = "987654321:ZZYYXXWWVVUUTTSSrrqq"
```

Each project with a dedicated bot gets its own Telegram chat, keeping conversations separate.

### `[projects.<name>]` — Project Overrides

| Key | Type | Description |
|-----|------|-------------|
| `type` | string | Set to `"group"` to treat subfolders as separate projects |

Example: if `~/work/my-org/` contains multiple repos:

```toml
[projects.my-org]
type = "group"
```

This makes `clint list` show `my-org/repo-a`, `my-org/repo-b`, etc.

## Environment Variable Overrides

| Env Var | Overrides |
|---------|-----------|
| `CLINT_PROJECTS_ROOT` | `projects_root` |
| `CLINT_HQ_BOT_TOKEN` | `telegram.hq_bot_token` |

## Next Steps

- [First Run](/getting-started/first-run) — start Clint for the first time
- [Telegram Setup](/guides/telegram) — create and configure your bots
