import {homedir} from 'node:os'
import {resolve} from 'node:path'

export const CLINT_DATA_DIR = resolve(homedir(), '.config/clint')
export const LOG_DIR = resolve(CLINT_DATA_DIR, 'logs')

export function expandHome(p: string): string {
  if (p.startsWith('~/')) return resolve(homedir(), p.slice(2))
  return p
}
