const { defineConfig } = require('@docmd/core');

module.exports = defineConfig({
  title: 'Clint',
  url: 'https://svallory.github.io/clint',
  src: 'docs',
  out: 'site',

  layout: {
    spa: true,
    header: { enabled: true },
    sidebar: { collapsible: true },
    footer: { style: 'minimal' },
  },

  navigation: [
    { title: 'Home', path: '/', icon: 'home' },
    {
      title: 'Getting Started',
      icon: 'rocket',
      children: [
        { title: 'Installation', path: '/getting-started/installation' },
        { title: 'Configuration', path: '/getting-started/configuration' },
        { title: 'First Run', path: '/getting-started/first-run' },
      ],
    },
    {
      title: 'Guides',
      icon: 'book-open',
      children: [
        { title: 'Telegram Setup', path: '/guides/telegram' },
        { title: 'Worktrees', path: '/guides/worktrees' },
        { title: 'Multi-Project Workflow', path: '/guides/multi-project' },
      ],
    },
    {
      title: 'Reference',
      icon: 'terminal',
      children: [
        { title: 'Commands', path: '/reference/commands' },
        { title: 'Configuration File', path: '/reference/config-file' },
        { title: 'Architecture', path: '/reference/architecture' },
      ],
    },
  ],

  theme: {
    name: 'default',
    defaultMode: 'system',
  },

  plugins: {
    search: {},
    llms: { fullContext: true },
    mermaid: {},
  },
});
