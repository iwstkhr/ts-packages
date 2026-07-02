# ts-packages monorepo

This repository is an npm workspaces monorepo for small TypeScript libraries.

## Packages

- [`@iwstkhr/ts-memoize`](./packages/ts-memoize): A small TypeScript memoization helper for caching the most recent function call.
- [`@iwstkhr/svg-to-png`](./packages/svg-to-png): A small browser TypeScript helper for rendering SVG images to PNG.

## Requirements

- Node.js 24, managed with [`mise`](https://mise.jdx.dev/)
- npm

Install the configured tool versions:

```sh
mise install
```

## Development

Install dependencies:

```sh
npm ci
```

Run all checks:

```sh
npm run check
npm run typecheck
npm test
npm run build
```

Run Biome with fixes:

```sh
npm run check:write
```

Check that package changes include a package version update:

```sh
npm run check:package-version
```

## Contributing

This repository uses GitHub Flow:

- Create a short-lived branch from `main`.
- Open a pull request for review.
- Merge the pull request into `main` after CI passes.
- Keep `main` releasable.

Use a lightweight Conventional Commits format for commit messages:

```text
<type>(optional-scope): <summary>
```

Common types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation-only change
- `test`: Test change
- `refactor`: Code change that does not alter behavior
- `chore`: Maintenance, dependency, or metadata change
- `ci`: CI configuration change

Examples:

```text
feat(ts-memoize): add cache reset support
fix(svg-to-png): handle invalid SVG input
docs: update contributing instructions
```

Before opening a pull request, make sure the following checks pass:

```sh
npm run check
npm run typecheck
npm test
npm run build
```

If your change touches a package under `packages/*`, update that package's `package.json` version in the same pull request and run:

```sh
npm run check:package-version
```

## Version Updates

When a package under `packages/*` is changed, update that package's `package.json` version in the same change. This is enforced by:

- Husky `pre-commit`
- Codex project hooks in `.codex/config.toml`
- Claude Code project hooks in `.claude/settings.json`

The shared implementation is `scripts/check-package-version.mjs`.

## CI

Pull requests and pushes to `main` run the `Check` GitHub Actions workflow:

- Biome
- Type checking
- Tests
- Build

## Publishing

Packages are published to GitHub Packages, not the public npm registry.

Publishing runs from `.github/workflows/publish.yml` after the `Check` workflow succeeds on `main`. The workflow can also be started manually from GitHub Actions.

Published package versions are tagged with each package basename and version:

```text
ts-memoize-v0.1.0
svg-to-png-v0.1.0
```
