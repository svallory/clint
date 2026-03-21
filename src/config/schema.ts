export interface HqConfig {
  name: string
  spawn_mode: 'same-dir' | 'worktree' | 'session'
  capacity: number
}

export interface ClaudeConfig {
  permission_mode?: 'default' | 'acceptEdits' | 'plan' | 'auto'
}

export interface TelegramConfig {
  hq_bot_token?: string
  project_bots: Record<string, string>
}

export interface ProjectOverride {
  type?: 'group'
}

export interface ClintConfig {
  projects_root: string
  hq: HqConfig
  claude: ClaudeConfig
  telegram: TelegramConfig
  projects: Record<string, ProjectOverride>
}

export const DEFAULT_CONFIG: ClintConfig = {
  projects_root: '~/work',
  hq: {
    name: 'clint-hq',
    spawn_mode: 'same-dir',
    capacity: 32,
  },
  claude: {
    permission_mode: 'default',
  },
  telegram: {
    project_bots: {},
  },
  projects: {},
}
