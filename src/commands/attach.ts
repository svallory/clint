import {Args, Command} from '@oclif/core'
import {execFileSync} from 'node:child_process'
import * as tmux from '../services/tmux.js'

export default class Attach extends Command {
  static override description = 'Attach to a Clint tmux session'

  static override examples = [
    '<%= config.bin %> attach',
    '<%= config.bin %> attach my-project',
  ]

  static override args = {
    session: Args.string({
      description: 'Session name or project name (default: clint-hq)',
      required: false,
    }),
  }

  async run(): Promise<void> {
    const {args} = await this.parse(Attach)
    let target = args.session ?? 'clint-hq'

    if (!target.startsWith('clint')) {
      target = `clint-${target}`
    }

    if (!tmux.sessionExists(target)) {
      this.error(`Session '${target}' not found. Run 'clint status' to see active sessions.`)
    }

    // Replace process with tmux attach
    execFileSync('tmux', ['attach', '-t', target], {stdio: 'inherit'})
  }
}
