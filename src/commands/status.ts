import {Command, Flags} from '@oclif/core'
import * as tmux from '../services/tmux.js'

export default class Status extends Command {
  static override description = 'Show running Clint sessions'

  static override examples = [
    '<%= config.bin %> status',
    '<%= config.bin %> status --json',
  ]

  static override flags = {
    json: Flags.boolean({description: 'Output as JSON', default: false}),
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(Status)
    const sessions = tmux.listSessions()

    if (flags.json) {
      this.log(JSON.stringify(sessions, null, 2))
      return
    }

    this.log('Clint Sessions')
    this.log('══════════════')

    if (sessions.length === 0) {
      this.log('  No active Clint sessions')
      this.log('')
      this.log('  Start one with: clint start')
      return
    }

    for (const session of sessions) {
      const isHq = session.name === 'clint-hq'
      const status = session.attached ? 'ATTACHED' : 'ONLINE'
      const tag = isHq ? '  (HQ)' : ''
      this.log(`  ${session.name.padEnd(24)} ${status.padEnd(10)} ${session.created}${tag}`)
    }
  }
}
