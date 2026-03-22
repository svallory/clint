# First Run

Once you've [installed](/getting-started/installation) Clint and [configured](/getting-started/configuration) it, you're ready to start the HQ session.

## Start the HQ

```bash
clint start
```

This creates a tmux session running `claude remote-control`. If Telegram is configured, channels are enabled automatically. On first run, an interactive setup wizard walks you through configuration.

After the session starts, you'll see a welcome banner:

```
╔═══════════════════════════════════════════════════════════════════╗
║  Clint HQ — Claude Code Command Center                          ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Config:    ~/.config/clint/config.toml                           ║
║  Projects:  ~/work (4 found)                                      ║
║  Telegram:  disabled                                              ║
║                                                                   ║
║  Session:   clint-hq                                              ║
║  Connect:   https://claude.ai/code?bridge=env_01ABC...            ║
║                                                                   ║
║  Commands:                                                        ║
║    clint list            List projects                            ║
║    clint spawn <name>    Start project session                    ║
║    clint status          Show running sessions                    ║
║    clint attach          Attach to HQ terminal                    ║
║    clint config          Show configuration                       ║
║    clint stop-all        Stop everything                          ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
```

The **Connect** URL is a direct link to your session — click it or paste it in your browser.

## Connect from claude.ai/code

1. Open [claude.ai/code](https://claude.ai/code)
2. Find the session named **clint-hq** in the session list
3. Click to connect — you now have full control of the Clint session from your browser

## Connect from Your Phone

1. Attach to the session to see the QR code: `clint attach`
2. Scan the QR code with the Claude mobile app
3. You can now control Clint from your phone

## Pair Telegram

If this is your first time using Telegram with Clint:

1. Open Telegram and message your HQ bot
2. The bot will reply with a pairing code
3. In the Clint session (via `clint attach` or claude.ai/code), run: `/telegram:access pair <code>`
4. Lock down access: `/telegram:access policy allowlist`

Once paired, Clint will send you a "Clint HQ is online" message every time it starts.

## Spawn Your First Project Session

```bash
# See what's available
clint list

# Spawn a session
clint spawn my-project
```

The session appears at claude.ai/code. You can also tell Clint via Telegram:

> "Open a session for my-project"

Clint will spawn it and tell you where to find it.

## Check Status

```bash
clint status
```

```
Clint Sessions
══════════════
  clint-hq            ONLINE   Sat Mar 21 14:00:00 2026  (HQ)
  clint-my-project    ONLINE   Sat Mar 21 14:05:00 2026
```

## Stop

```bash
# Stop a specific session
clint stop my-project

# Stop everything
clint stop-all
```
