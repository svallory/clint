# Clint

> Claude Code Command Center — calm, decisive, always in control.

Clint is a CLI tool that turns [Claude Code](https://docs.anthropic.com/en/docs/claude-code) into an always-running command center. It manages persistent Claude sessions via tmux, controllable from anywhere through [Remote Control](https://code.claude.com/docs/en/remote-control) (claude.ai/code, mobile) and [Telegram Channels](https://code.claude.com/docs/en/channels).

Named after Clint Eastwood. You tell it what to do. It gets it done.

## What It Does

- **Always-on HQ session** — A persistent Claude Code instance running in tmux, reachable from your phone, browser, or another terminal
- **Spawn project sessions** — Start new Claude sessions for any project with a single command
- **Worktree-aware** — Integrates with [Worktrunk](https://github.com/nicholasgasior/worktrunk) (`wt`) for git worktree management
- **Telegram integration** — Control Clint and receive updates via Telegram bots, with per-project chat isolation
- **Multi-project coordination** — Manage sessions across all your projects from one place

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) runtime
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) CLI (`claude`) with a Pro/Max/Team/Enterprise subscription
- [tmux](https://github.com/tmux/tmux) for session persistence
- [Remote Control](https://code.claude.com/docs/en/remote-control) enabled on your account
- A Telegram bot token (from [@BotFather](https://t.me/botfather))

### Install

```bash
git clone https://github.com/svallory/clint.git ~/work/clint
cd ~/work/clint
bun install

# Symlink for global access
mkdir -p ~/.local/bin
ln -sf ~/work/clint/bin/dev.ts ~/.local/bin/clint

# Make sure ~/.local/bin is in your PATH
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
```

### Configure

Create `~/.config/clint/config.toml`:

```toml
projects_root = "~/work"

[telegram]
hq_bot_token = "YOUR_BOT_TOKEN_HERE"
```

See [Configuration](https://svallory.github.io/clint/configuration) for all options.

### Run

```bash
# Start the HQ session
clint start

# Attach to see the QR code / session URL
clint attach

# Connect from claude.ai/code or your phone
```

## Commands

| Command | Description |
|---------|-------------|
| `clint start` | Start the Clint HQ session |
| `clint spawn <project>` | Spawn a Claude session for a project |
| `clint list` | List all projects and their worktrees |
| `clint status` | Show running sessions |
| `clint attach [session]` | Attach to a tmux session |
| `clint stop [session]` | Stop a session |
| `clint stop-all` | Stop all Clint sessions |

### Spawning with Worktrees

```bash
# Spawn on the main branch
clint spawn my-project

# Spawn on an existing worktree
clint spawn my-project --worktree feat-auth

# Create a new worktree and spawn
clint spawn my-project --new-worktree feat-login
```

## Telegram

Clint uses a **bot-per-project** model for Telegram. Each project can have its own Telegram bot, giving it a dedicated chat.

1. Create bots via [@BotFather](https://t.me/botfather) on Telegram
2. Add tokens to your config:

```toml
[telegram]
hq_bot_token = "123:AAA..."

[telegram.project_bots]
my-project = "456:BBB..."
another-project = "789:CCC..."
```

3. Message your HQ bot to tell Clint to spawn sessions, check status, or coordinate work

See [Telegram Setup](https://svallory.github.io/clint/telegram) for the full guide.

## How It Works

```
You (phone/browser/terminal)
    │
    ├── claude.ai/code ──► Remote Control ──► Claude session in tmux
    │
    └── Telegram ──► Channel plugin ──► Claude session in tmux
                                            │
                                            ├── Your project files
                                            ├── MCP servers
                                            └── Full Claude Code toolset
```

Each session is a `claude remote-control` process running inside a tmux session. Clint manages the lifecycle — creating, listing, and stopping these sessions. The HQ session (Clint itself) can spawn new sessions on demand, including via Telegram messages.

## Documentation

Full documentation is available at **[svallory.github.io/clint](https://svallory.github.io/clint)**.

## Development

```bash
# Run commands in dev mode
bun run dev -- list
bun run dev -- start
bun run dev -- spawn my-project

# Build
bun run build

# Test
bun test
```

## License

MIT
