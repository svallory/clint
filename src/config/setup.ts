import * as p from '@clack/prompts'
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs'
import {homedir} from 'node:os'
import {dirname, resolve} from 'node:path'
import {spawnSync} from 'node:child_process'
import {CONFIG_PATH, configExists, loadConfig} from './index.js'
import type {ClintConfig} from './schema.js'

function expandHome(path: string): string {
  if (path.startsWith('~/')) return resolve(homedir(), path.slice(2))
  return path
}

/**
 * Check if a directory is trusted by Claude Code.
 * Workspace trust is stored as project dirs under ~/.claude/projects/
 * with path encoded using dashes (e.g. /Users/foo/work → -Users-foo-work).
 */
function isWorkspaceTrusted(dir: string): boolean {
  const encoded = dir.replace(/\//g, '-')
  const projectDir = resolve(homedir(), '.claude/projects', encoded)
  return existsSync(projectDir)
}

/**
 * Trust a workspace by running `claude` with a simple prompt.
 * Uses --print mode with --dangerously-skip-permissions to avoid interactive trust dialog.
 */
function trustWorkspace(dir: string): boolean {
  p.log.step(`Trusting workspace: ${dir}`)

  const result = spawnSync('claude', [
    '-p', 'say ok',
    '--dangerously-skip-permissions',
  ], {
    cwd: dir,
    encoding: 'utf-8',
    timeout: 15_000,
    stdio: ['pipe', 'pipe', 'pipe'],
  })

  if (result.status === 0) {
    return true
  }

  // If --dangerously-skip-permissions doesn't work, the directory
  // may need manual trust. Return false and let the caller handle it.
  return isWorkspaceTrusted(dir)
}

export async function runSetupIfNeeded(): Promise<ClintConfig> {
  if (configExists()) {
    return loadConfig()
  }

  p.intro('Welcome to Clint — Claude Code Command Center')

  p.note(
    'No configuration file found.\n' +
    "Let's get you set up. This will only take a moment.",
    'First-time setup',
  )

  // Step 1: Projects root
  const projectsRoot = await p.text({
    message: 'Where do your projects live?',
    placeholder: '~/work',
    defaultValue: '~/work',
    validate(value) {
      if (!value?.trim()) return 'Please enter a path'
    },
  })

  if (p.isCancel(projectsRoot)) {
    p.cancel('Setup cancelled.')
    process.exit(0)
  }

  const expandedRoot = expandHome(projectsRoot)

  // Step 2: Ensure directory exists
  if (!existsSync(expandedRoot)) {
    const create = await p.confirm({
      message: `Directory ${expandedRoot} doesn't exist. Create it?`,
      initialValue: true,
    })
    if (p.isCancel(create) || !create) {
      p.cancel('Setup cancelled.')
      process.exit(0)
    }
    mkdirSync(expandedRoot, {recursive: true})
    p.log.success(`Created ${expandedRoot}`)
  }

  // Step 3: Workspace trust
  if (!isWorkspaceTrusted(expandedRoot)) {
    p.note(
      'Claude Code requires workspace trust before it can run in a directory.\n' +
      `Clint needs trust for: ${expandedRoot}\n\n` +
      'This is a one-time step.',
      'Workspace Trust',
    )

    const doTrust = await p.confirm({
      message: `Trust ${expandedRoot} for Claude Code?`,
      initialValue: true,
    })

    if (p.isCancel(doTrust) || !doTrust) {
      p.log.warning(
        `You'll need to trust this directory manually before running 'clint start'.\n` +
        `Run: claude -p "hello" in ${expandedRoot}`,
      )
    } else {
      const trusted = trustWorkspace(expandedRoot)
      if (trusted) {
        p.log.success('Workspace trusted.')
      } else {
        p.log.warning(
          'Could not automatically trust the workspace.\n' +
          `Please run this command manually:\n\n` +
          `  cd ${expandedRoot} && claude\n\n` +
          'Accept the trust dialog, then exit and run clint start again.',
        )
      }
    }
  } else {
    p.log.success('Workspace already trusted by Claude Code.')
  }

  // Step 4: Telegram
  const useTelegram = await p.confirm({
    message: 'Do you want to enable Telegram integration?',
    initialValue: false,
  })

  if (p.isCancel(useTelegram)) {
    p.cancel('Setup cancelled.')
    process.exit(0)
  }

  let hqBotToken = ''

  if (useTelegram) {
    p.note(
      '1. Open Telegram and message @BotFather\n' +
      '2. Send /newbot and follow the prompts\n' +
      '3. Copy the token BotFather gives you',
      'Create a Telegram bot',
    )

    const token = await p.text({
      message: 'Paste your Telegram bot token:',
      placeholder: '123456789:AABBCCDDEEFFGGHHIIJJKKLLMMNNOOPPqqr',
      validate(value) {
        if (!value?.trim()) return 'Please enter a token'
        if (!value?.includes(':')) return 'That doesn\'t look like a bot token (should contain a colon)'
      },
    })

    if (p.isCancel(token)) {
      p.cancel('Setup cancelled.')
      process.exit(0)
    }

    hqBotToken = token
  }

  // Build TOML config
  const lines: string[] = [
    '# Clint — Claude Code Command Center',
    '',
    `projects_root = "${projectsRoot}"`,
    '',
    '[hq]',
    'name = "clint-hq"',
    'spawn_mode = "same-dir"',
    'capacity = 32',
    '',
    '[claude]',
    'permission_mode = "default"',
    '',
    '[telegram]',
  ]

  if (hqBotToken) {
    lines.push(`hq_bot_token = "${hqBotToken}"`)
  } else {
    lines.push('# Telegram is disabled. To enable later, add:')
    lines.push('# hq_bot_token = "YOUR_BOT_TOKEN"')
  }

  lines.push(
    '',
    '[telegram.project_bots]',
    '# Add dedicated bots for specific projects:',
    '# my-project = "BOT_TOKEN"',
    '',
    '# [projects.my-org]',
    '# type = "group"  # Treat subfolders as separate projects',
    '',
  )

  const configContent = lines.join('\n')

  // Write config
  const configDir = dirname(CONFIG_PATH)
  if (!existsSync(configDir)) {
    mkdirSync(configDir, {recursive: true})
  }

  writeFileSync(CONFIG_PATH, configContent, 'utf-8')

  p.note(CONFIG_PATH, 'Config saved to')

  if (!useTelegram) {
    p.log.info('Telegram is disabled. Sessions will use Remote Control only (claude.ai/code + mobile).')
    p.log.info('You can enable Telegram later by adding a bot token to your config file.')
  }

  p.outro('Setup complete! Starting Clint...')

  return loadConfig()
}
