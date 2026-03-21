# Clint

> Claude Code Command Center — calm, decisive, always in control.

Clint turns [Claude Code](https://docs.anthropic.com/en/docs/claude-code) into an always-running command center. It manages persistent Claude sessions via tmux, controllable from anywhere through [Remote Control](https://code.claude.com/docs/en/remote-control) and [Telegram Channels](https://code.claude.com/docs/en/channels).

## Why Clint?

Claude Code is powerful, but it's ephemeral. Close your terminal and the session is gone. Clint solves this:

- **Persistence** — Sessions survive terminal closes, reboots, network drops
- **Remote access** — Control Claude from your phone, browser, or any device via claude.ai/code
- **Telegram bridge** — Send commands and receive updates via Telegram
- **Multi-project** — Manage Claude sessions across all your projects from one place
- **Worktree-aware** — First-class support for git worktrees via Worktrunk

## How It Works

```
You (phone / browser / terminal)
    |
    +-- claude.ai/code --> Remote Control --> Claude session in tmux
    |
    +-- Telegram -------> Channel plugin --> Claude session in tmux
                                               |
                                               +-- Your project files
                                               +-- MCP servers
                                               +-- Full Claude Code toolset
```

Clint runs Claude Code in **remote-control server mode** inside tmux sessions. Each session is a full Claude Code instance with access to your filesystem, tools, and MCP servers — just like a local terminal session, but reachable from anywhere.

The **HQ session** is Clint itself. It coordinates everything: spawning new sessions, managing their lifecycle, and responding to Telegram messages.

## Quick Start

```bash
# Install
git clone https://github.com/svallory/clint.git ~/work/clint
cd ~/work/clint && bun install

# Configure
mkdir -p ~/.config/clint
cat > ~/.config/clint/config.toml << 'EOF'
projects_root = "~/work"

[telegram]
hq_bot_token = "YOUR_TOKEN_HERE"
EOF

# Run
bun run dev -- start
```

Read the full [Installation Guide](/getting-started/installation) to get started.
