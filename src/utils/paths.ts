import {homedir} from 'node:os'
import {resolve} from 'node:path'

export const CLINT_DIR = resolve(import.meta.dirname ?? '.', '../..')
export const LOG_DIR = resolve(CLINT_DIR, 'logs')

export function expandHome(p: string): string {
  if (p.startsWith('~/')) return resolve(homedir(), p.slice(2))
  return p
}
