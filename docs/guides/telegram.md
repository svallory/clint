# Telegram Setup

Clint uses Claude Code's [Channels](https://code.claude.com/docs/en/channels) feature to integrate with Telegram. Each session can have its own Telegram bot, giving it a dedicated chat.

## Create Your First Bot

1. Open Telegram and message [@BotFather](https://t.me/botfather)
2. Send `/newbot`
3. Choose a name (e.g., "Clint HQ")
4. Choose a username (e.g., `clint_hq_bot`)
5. Copy the token BotFather gives you

## Configure the HQ Bot

Add the token to `~/.config/clint/config.toml`:

```toml
[telegram]
hq_bot_token = "123456789:AABBCCDDEEFFGGHHIIJJKKLLMMNNOOPPqqr"
```

## Pair Your Account

The first time you start Clint with a new bot:

1. Start Clint: `clint start`
2. Message your bot on Telegram (any message)
3. The bot replies with a **pairing code**
4. In the Clint session (attach via `clint attach` or claude.ai/code), run:
   ```
   /telegram:access pair YOUR_CODE
   ```
5. Lock access to your account only:
   ```
   /telegram:access policy allowlist
   ```

After pairing, Clint sends a confirmation message every time the HQ starts.

## Per-Project Bots

For separate conversations per project, create additional bots:

1. Create more bots via @BotFather (e.g., `myproject_claude_bot`)
2. Add them to your config:

```toml
[telegram.project_bots]
my-api = "456789012:BBCCDDEEFFGGHHIIJJKKLLMMNNOOPPqqrr"
my-frontend = "789012345:CCDDEEFFGGHHIIJJKKLLMMNNOOPPqqrrss"
```

3. When you spawn a session for that project, Clint automatically uses the dedicated bot:

```bash
clint spawn my-api
# This session communicates via the my-api bot
```

### What Happens Without a Dedicated Bot

If a project doesn't have a bot token in the config, the spawned session runs **without Telegram**. It's still accessible via claude.ai/code (Remote Control always works).

## Telling Clint to Spawn Sessions

Once paired, you can message the HQ bot to manage sessions:

> "Start a session for my-api"

> "Open my-frontend on worktree feat-redesign"

> "Create a new worktree for my-api called fix-auth and start a session"

> "What sessions are running?"

> "Stop the my-frontend session"

Clint parses these requests, runs the appropriate `clint` CLI commands, and replies with status and connection instructions.

## How Channels Work

Claude Code Channels are MCP servers that push events into a running session. The Telegram channel plugin:

- Receives messages from Telegram and injects them into the Claude session
- Exposes a `reply` tool that Claude uses to send messages back
- Supports file attachments, emoji reactions, and message editing
- Only processes messages from accounts on the allowlist

Each bot has its own state directory (`~/.config/clint/telegram-state/<project>/`), keeping pairing and allowlist data separate.

## Security

- **Allowlist**: Only paired Telegram accounts can send messages to Clint
- **Pairing**: Requires physical access to the running Claude session to approve
- **Bot isolation**: Each bot has its own token and state — compromising one doesn't affect others
- **Local execution**: All code runs on your machine. Telegram only carries chat messages.
