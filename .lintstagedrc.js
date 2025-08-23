/**
 * lint-staged Configuration for English Learning Town Monorepo
 * Runs formatting and linting on staged files before commit
 */

export default {
  // TypeScript and JavaScript files (excluding docs and generated files)
  "!(docs|**/docs)/**/*.{ts,tsx,js,jsx}": [
    "prettier --write",
    "eslint --config configs/eslint.config.js --fix"
  ],

  // JSON files
  "**/*.{json,jsonc}": ["prettier --write"],

  // CSS and SCSS files
  "**/*.{css,scss}": ["prettier --write"],

  // Markdown files
  "**/*.md": ["prettier --write"],

  // YAML files
  "**/*.{yml,yaml}": ["prettier --write"],
};
