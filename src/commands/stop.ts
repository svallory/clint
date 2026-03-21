import {Args, Command} from '@oclif/core'
import * as tmux from '../services/tmux.js'
import {log} from '../utils/log.js'

export default class Stop extends Command {
  static override description = 'Stop a Clint session'

  static override examples = [
    '<%= config.bin %> stop',
    '<%= config.bin %> stop my-project',
    '<%= config.bin %> stop clint-hq',
  ]

  static override args = {
    session: Args.string({
      description: 'Session name or project name (default: clint-hq)',
      required: false,
    }),
  }

  async run(): Promise<void> {
    const {args} = await this.parse(Stop)
    let target = args.session ?? 'clint-hq'

    // Prefix with clint- if not already
    if (!target.startsWith('clint')) {
      target = `clint-${target}`
    }

    if (tmux.killSession(target)) {
      log(`Stopped session: ${target}`)
    } else {
      this.error(`Session '${target}' not found`)
    }
  }
}
