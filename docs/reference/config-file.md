# Configuration File Reference

Clint reads its configuration from `~/.config/clint/config.toml`.

## Full Example

```toml
# Root directory containing your projects
projects_root = "~/work"

# HQ session settings
[hq]
name = "clint-hq"          # tmux session name
spawn_mode = "same-dir"     # same-dir | worktree | session
capacity = 32               # max concurrent Remote Control sessions

# Default Claude Code settings for spawned sessions
[claude]
permission_mode = "default" # default | acceptEdits | plan | auto

# Telegram integration
[telegram]
hq_bot_token = "123456789:AABBCCDDEEFFGGHHIIJJKKLLMMNNOOPPqqr"

# Per-project Telegram bots (optional)
[telegram.project_bots]
my-api = "456789012:BBCCDDEEFFGGHHIIJJKKLLMMNNOOPPqqrr"
my-frontend = "789012345:CCDDEEFFGGHHIIJJKKLLMMNNOOPPqqrrss"

# Project overrides (optional)
[projects.my-org]
type = "group"   # Treat subfolders as separate projects
```

## All Options

### `projects_root`

- **Type:** string
- **Default:** `~/work`
- **Env override:** `CLINT_PROJECTS_ROOT`

The root directory under which Clint looks for projects. Each direct child directory is treated as a project. The `~` prefix is expanded to the user's home directory.

### `[hq]`

Configuration for the HQ session.

#### `hq.name`

- **Type:** string
- **Default:** `clint-hq`

The tmux session name used for the HQ session.

#### `hq.spawn_mode`

- **Type:** `same-dir` | `worktree` | `session`
- **Default:** `same-dir`

How Remote Control creates new sessions:

- `same-dir` — All sessions share the same working directory
- `worktree` — Each session gets its own git worktree (requires a git repo)
- `session` — Classic single-session mode (exits when the session ends)

#### `hq.capacity`

- **Type:** integer
- **Default:** `32`

Maximum number of concurrent Remote Control sessions.

### `[claude]`

Default settings applied to all spawned Claude sessions.

#### `claude.permission_mode`

- **Type:** `default` | `acceptEdits` | `plan` | `auto`
- **Default:** `default`

The permission mode for Claude Code sessions:

- `default` — Standard interactive permissions
- `acceptEdits` — Auto-accept file edits
- `plan` — Plan mode (no edits without approval)
- `auto` — Full autonomous mode

### `[telegram]`

#### `telegram.hq_bot_token`

- **Type:** string
- **Required** for `clint start`
- **Env override:** `CLINT_HQ_BOT_TOKEN`

The Telegram bot token for the HQ session. Create one via [@BotFather](https://t.me/botfather).

#### `[telegram.project_bots]`

- **Type:** key-value pairs (project name → bot token)
- **Optional**

Map of project names to dedicated Telegram bot tokens. Projects with a dedicated bot get their own Telegram chat. Projects without one run without Telegram (Remote Control still works).

### `[projects.<name>]`

Per-directory overrides.

#### `projects.<name>.type`

- **Type:** `group`

When set to `"group"`, Clint recurses into the directory and treats each subfolder as a separate project. Useful for monorepos and org folders.

## File Location

The config file is always at:

```
~/.config/clint/config.toml
```

This follows the [XDG Base Directory Specification](https://specifications.freedesktop.org/basedir-spec/basedir-spec-latest.html) convention for user configuration.
