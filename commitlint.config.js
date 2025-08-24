module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'docs', // Documentation changes
        'style', // Code style changes (formatting, missing semicolons, etc)
        'refactor', // Code refactoring
        'perf', // Performance improvements
        'test', // Adding or updating tests
        'build', // Build system or external dependency changes
        'ci', // CI/CD changes
        'chore', // Other changes that don't modify src or test files
        'revert', // Revert a previous commit
        'game', // Game-specific features or mechanics
        'content', // Game content updates (dialogues, quests, etc)
        'audio', // Audio-related changes (speech recognition, TTS)
        'ui', // UI component changes
        'data', // Data structure or model changes
      ],
    ],
    'scope-enum': [
      2,
      'always',
      [
        // Core systems
        'core',
        'engine',
        'events',
        'config',
        'logger',
        'errors',
        
        // Game systems
        'character',
        'dialogue',
        'quest',
        'inventory',
        'progress',
        'game-state',
        
        // Content
        'content',
        'characters',
        'dialogues',
        'quests',
        'locations',
        'items',
        
        // Audio
        'speech',
        'recognition',
        'tts',
        'audio',
        
        // UI
        'ui',
        'components',
        'design-system',
        
        // Tools & Infrastructure
        'build',
        'quality',
        'tests',
        'ci',
        'deps',
        
        // Data & Storage
        'storage',
        'types',
        'models',
        'validators',
      ],
    ],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-empty': [2, 'never'],
    'subject-max-length': [2, 'always', 72],
    'header-max-length': [2, 'always', 100],
  },
};