import {Command} from '@oclif/core'
import * as tmux from '../services/tmux.js'
import {log} from '../utils/log.js'

export default class StopAll extends Command {
  static override description = 'Stop all Clint-managed sessions'

  static override examples = ['<%= config.bin %> stop-all']

  async run(): Promise<void> {
    await this.parse(StopAll)
    const sessions = tmux.listSessions()

    if (sessions.length === 0) {
      this.log('No Clint sessions running')
      return
    }

    for (const session of sessions) {
      tmux.killSession(session.name)
      log(`Stopped: ${session.name}`)
    }
  }
}
