import {execFileSync, spawnSync} from 'node:child_process'

export interface TmuxSession {
  name: string
  created: string
  windows: number
  attached: boolean
}

function run(args: string[]): {ok: boolean; stdout: string; stderr: string} {
  const result = spawnSync('tmux', args, {encoding: 'utf-8'})
  return {
    ok: result.status === 0,
    stdout: (result.stdout ?? '').trim(),
    stderr: (result.stderr ?? '').trim(),
  }
}

export function sessionExists(name: string): boolean {
  return run(['has-session', '-t', name]).ok
}

export function createSession(opts: {name: string; cwd: string; command: string}): void {
  const result = run([
    'new-session', '-d',
    '-s', opts.name,
    '-c', opts.cwd,
    opts.command,
  ])
  if (!result.ok) {
    throw new Error(`Failed to create tmux session '${opts.name}': ${result.stderr}`)
  }
}

export function killSession(name: string): boolean {
  return run(['kill-session', '-t', name]).ok
}

export function listSessions(prefix = 'clint'): TmuxSession[] {
  const format = '#{session_name}\t#{session_created_string}\t#{session_windows}\t#{?session_attached,1,0}'
  const result = run(['list-sessions', '-F', format])
  if (!result.ok) return []

  return result.stdout
    .split('\n')
    .filter((line) => line.startsWith(prefix))
    .map((line) => {
      const [name, created, windows, attached] = line.split('\t')
      return {
        name: name!,
        created: created!,
        windows: Number.parseInt(windows!, 10),
        attached: attached === '1',
      }
    })
}

export function attachSession(name: string): never {
  execFileSync('tmux', ['attach', '-t', name], {stdio: 'inherit'})
  process.exit(0)
}
