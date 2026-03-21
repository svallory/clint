# Installation

## Prerequisites

Before installing Clint, make sure you have:

| Dependency | Version | Purpose |
|-----------|---------|---------|
| [Bun](https://bun.sh) | 1.0+ | JavaScript runtime and package manager |
| [Claude Code](https://docs.anthropic.com/en/docs/claude-code) | 2.1.51+ | The CLI being managed |
| [tmux](https://github.com/tmux/tmux) | 3.0+ | Session persistence |
| A Claude subscription | Pro/Max/Team/Enterprise | Required for Remote Control |

### Optional

| Dependency | Purpose |
|-----------|---------|
| [Worktrunk](https://github.com/nicholasgasior/worktrunk) (`wt`) | Git worktree management |
| A Telegram bot token | Telegram channel integration |

## Install Clint

```bash
git clone https://github.com/svallory/clint.git ~/work/clint
cd ~/work/clint
bun install
```

## Add to PATH

Create a symlink so `clint` is available globally:

```bash
mkdir -p ~/.local/bin
ln -sf ~/work/clint/bin/dev.ts ~/.local/bin/clint
```

Add `~/.local/bin` to your PATH if it isn't already:

```bash
# For zsh (macOS default)
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# For bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
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
