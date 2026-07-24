# ts-packages monorepo

This repository is an npm workspaces monorepo for small TypeScript libraries.

## Packages

- [`@iwstkhr/ts-memoize`](./packages/ts-memoize): A small TypeScript
  memoization helper for caching the most recent function call.
- [`@iwstkhr/svg-to-png`](./packages/svg-to-png): A small browser TypeScript
  helper for rendering SVG images to PNG.

## Requirements

- Node.js 24.18.0 and pre-commit 4.6.1, specified in [`mise.toml`](./mise.toml)
- npm

Use [mise](https://mise.jdx.dev/) to install the specified tools:

```sh
mise install
```

## Development

Install dependencies and enable git hooks:

```sh
npm ci
pre-commit install
```

Hooks are defined in [`.pre-commit-config.yaml`](./.pre-commit-config.yaml)
and run on commit (YAML checks, actionlint, Biome, gitleaks, markdownlint,
shellcheck).

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

Run the full pre-commit suite against all files:

```sh
pre-commit run --all-files
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
pre-commit run --all-files
npm run check
npm run typecheck
npm test
npm run build
```

## CI

Pull requests and pushes to `main` run the `Check` GitHub Actions workflow:

- Biome
- Type checking
- Tests
- Build

## Publishing

Packages are published to GitHub Packages, not the public npm registry.

Publishing runs from `.github/workflows/publish.yml` after the `Check`
workflow succeeds on `main`. The workflow can also be started manually from
GitHub Actions.

Published package versions are tagged with each package basename and version:

```text
ts-memoize-v0.1.0
svg-to-png-v0.1.0
```
