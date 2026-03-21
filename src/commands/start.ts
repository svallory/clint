import {Command, Flags} from '@oclif/core'
import {mkdirSync} from 'node:fs'
import {resolve} from 'node:path'
import {loadConfig} from '../config/index.js'
import {buildClaudeCommand} from '../services/claude.js'
import {getHqTelegramEnv} from '../services/telegram.js'
import * as tmux from '../services/tmux.js'
import {CLINT_DIR, LOG_DIR} from '../utils/paths.js'
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
    const config = loadConfig({requireTelegram: true})

    const sessionName = flags.name ?? config.hq.name
    const spawnMode = flags['spawn-mode'] ?? config.hq.spawn_mode
    const capacity = flags.capacity ?? config.hq.capacity
    const permissionMode = flags['permission-mode'] ?? config.claude.permission_mode

    if (tmux.sessionExists(sessionName)) {
      log(`Session '${sessionName}' is already running. Use 'clint attach' to connect.`)
      return
    }

    mkdirSync(LOG_DIR, {recursive: true})

    const telegramEnv = getHqTelegramEnv(config)
    const logFile = resolve(LOG_DIR, `${sessionName}.log`)

    const command = buildClaudeCommand({
      name: sessionName,
      spawnMode,
      capacity,
      permissionMode,
      telegramBotToken: telegramEnv.TELEGRAM_BOT_TOKEN,
      telegramStateDir: telegramEnv.TELEGRAM_STATE_DIR,
      logFile,
    })

    log(`Starting Clint HQ session: ${sessionName}`)
    log(`Working directory: ${CLINT_DIR}`)

    tmux.createSession({name: sessionName, cwd: CLINT_DIR, command})

    log('')
    log('Session started. Connect via:')
    log(`  Web:      claude.ai/code → find session '${sessionName}'`)
    log('  Terminal: clint attach')
    log(`  QR code:  tmux attach -t ${sessionName}`)
    log('  Telegram: Message your HQ bot')
  }
}
