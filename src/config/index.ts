import {existsSync, readFileSync} from 'node:fs'
import {homedir} from 'node:os'
import {resolve} from 'node:path'
import {parse as parseTOML} from 'smol-toml'
import {type ClintConfig, DEFAULT_CONFIG} from './schema.js'

const CONFIG_PATH = resolve(homedir(), '.config/clint/config.toml')

function expandHome(p: string): string {
  if (p.startsWith('~/')) return resolve(homedir(), p.slice(2))
  return p
}

function deepMerge<T extends Record<string, unknown>>(base: T, override: Record<string, unknown>): T {
  const result = {...base} as Record<string, unknown>
  for (const [key, value] of Object.entries(override)) {
    if (value !== null && typeof value === 'object' && !Array.isArray(value) &&
        result[key] !== null && typeof result[key] === 'object' && !Array.isArray(result[key])) {
      result[key] = deepMerge(result[key] as Record<string, unknown>, value as Record<string, unknown>)
    } else {
      result[key] = value
    }
  }
  return result as T
}

export function configExists(): boolean {
  return existsSync(CONFIG_PATH)
}

export function loadConfig(): ClintConfig {
  let fileConfig: Record<string, unknown> = {}

  if (existsSync(CONFIG_PATH)) {
    const raw = readFileSync(CONFIG_PATH, 'utf-8')
    fileConfig = parseTOML(raw) as Record<string, unknown>
  }

  const merged = deepMerge(DEFAULT_CONFIG as unknown as Record<string, unknown>, fileConfig) as unknown as ClintConfig

  // Env var overrides
  if (process.env.CLINT_PROJECTS_ROOT) {
    merged.projects_root = process.env.CLINT_PROJECTS_ROOT
  }
  if (process.env.CLINT_HQ_BOT_TOKEN) {
    merged.telegram = merged.telegram ?? {} as ClintConfig['telegram']
    merged.telegram.hq_bot_token = process.env.CLINT_HQ_BOT_TOKEN
  }

  // Expand paths
  merged.projects_root = expandHome(merged.projects_root)

  return merged
}

export {CONFIG_PATH}
