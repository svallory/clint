import {Command, Flags} from '@oclif/core'
import {mkdirSync} from 'node:fs'
import {resolve} from 'node:path'
import {runSetupIfNeeded} from '../config/setup.js'
import {buildClaudeCommand} from '../services/claude.js'
import {getHqTelegramEnv} from '../services/telegram.js'
import * as tmux from '../services/tmux.js'
import {LOG_DIR} from '../utils/paths.js'
import {log} from '../utils/log.js'

export default class Start extends Command {
  static override description = 'Start the Clint HQ session'

  static override examples = [
    '<%= config.bin %> start',
    '<%= config.bin %> start --spawn-mode worktree',
    '<%= config.bin %> start --capacity 16',
  ]

  static override flags = {
    name: Flags.string({description: 'Custom session name', default: undefined}),
    'spawn-mode': Flags.string({
      description: 'How new sessions are created',
      options: ['same-dir', 'worktree', 'session'],
      default: undefined,
    }),
    'permission-mode': Flags.string({
      description: 'Permission mode for sessions',
      options: ['default', 'acceptEdits', 'plan', 'auto'],
      default: undefined,
    }),
    capacity: Flags.integer({description: 'Max concurrent sessions', default: undefined}),
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(Start)
    const config = await runSetupIfNeeded()

    const sessionName = flags.name ?? config.hq.name
    const spawnMode = flags['spawn-mode'] ?? config.hq.spawn_mode
    const capacity = flags.capacity ?? config.hq.capacity
    const permissionMode = flags['permission-mode'] ?? config.claude.permission_mode

    if (tmux.sessionExists(sessionName)) {
      log(`Session '${sessionName}' is already running. Use 'clint attach' to connect.`)
      return
    }

    mkdirSync(LOG_DIR, {recursive: true})

    const telegramEnv = config.telegram.hq_bot_token
      ? getHqTelegramEnv(config)
      : null

    const logFile = resolve(LOG_DIR, `${sessionName}.log`)

    const command = buildClaudeCommand({
      name: sessionName,
      spawnMode,
      capacity,
      permissionMode,
      telegramBotToken: telegramEnv?.TELEGRAM_BOT_TOKEN,
      telegramStateDir: telegramEnv?.TELEGRAM_STATE_DIR,
      logFile,
    })

    const cwd = config.projects_root

    log(`Starting Clint HQ session: ${sessionName}`)
    log(`Working directory: ${cwd}`)
    if (telegramEnv) {
      log('Telegram: enabled')
    } else {
      log('Telegram: disabled (no bot token configured)')
    }

    tmux.createSession({name: sessionName, cwd, command})

    log('')
    log('Session started. Connect via:')
    log(`  Web:      claude.ai/code → find session '${sessionName}'`)
    log('  Terminal: clint attach')
    log(`  QR code:  tmux attach -t ${sessionName}`)
    if (telegramEnv) {
      log('  Telegram: Message your HQ bot')
    }
  }
}
