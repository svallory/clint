export interface ClaudeCommandOpts {
  name: string
  spawnMode?: string
  capacity?: number
  permissionMode?: string
  telegramBotToken?: string
  telegramStateDir?: string
  logFile: string
}

export function buildClaudeCommand(opts: ClaudeCommandOpts): string {
  const parts: string[] = []

  // CLAUDE_CODE_OAUTH_TOKEN breaks remote-control — it must use interactive auth
  parts.push('unset CLAUDE_CODE_OAUTH_TOKEN;')

  // Environment variables for Telegram
  if (opts.telegramBotToken) {
    parts.push(`TELEGRAM_BOT_TOKEN='${opts.telegramBotToken}'`)
    if (opts.telegramStateDir) {
      parts.push(`TELEGRAM_STATE_DIR='${opts.telegramStateDir}'`)
    }
  }

  parts.push('claude')
  parts.push('remote-control')
  parts.push(`--name '${opts.name}'`)

  if (opts.spawnMode) {
    parts.push(`--spawn ${opts.spawnMode}`)
  }

  if (opts.capacity) {
    parts.push(`--capacity ${opts.capacity}`)
  }

  if (opts.permissionMode) {
    parts.push(`--permission-mode ${opts.permissionMode}`)
  }

  // Add Telegram channel if bot token is configured
  if (opts.telegramBotToken) {
    parts.push('--channels plugin:telegram@claude-plugins-official')
  }

  // Pipe to log file
  parts.push(`2>&1 | tee -a '${opts.logFile}'`)

  return parts.join(' ')
}
