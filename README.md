# ts-packages monorepo

This repository is a pnpm workspaces monorepo for small TypeScript libraries,
with tasks orchestrated by [Turborepo](https://turborepo.com/).

## Packages

- [`@iwstkhr/ts-memoize`](./packages/ts-memoize): A small TypeScript
  memoization helper for caching the most recent function call.
- [`@iwstkhr/svg-to-png`](./packages/svg-to-png): A small browser TypeScript
  helper for rendering SVG images to PNG.

## Requirements

- Node.js 24.21.0, pnpm 12.4.2, and pre-commit 4.6.2, specified in
  [`mise.toml`](./mise.toml)

Use [mise](https://mise.jdx.dev/) to install the specified tools:

```sh
mise install
```

## Development

Install dependencies and enable git hooks:

```sh
pnpm install
pre-commit install
```

Hooks are defined in [`.pre-commit-config.yaml`](./.pre-commit-config.yaml)
and run on commit (YAML checks, actionlint, Biome, gitleaks, markdownlint,
shellcheck).

Run all checks:

```sh
pnpm run check
pnpm run typecheck
pnpm test
pnpm run build
```

Run Biome with fixes:

```sh
pnpm run check:write
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
pnpm run check
pnpm run typecheck
pnpm test
pnpm run build
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

The workflow skips package versions that are already published. To release
changes to a package, update its version in `packages/<package>/package.json`
and keep `pnpm-lock.yaml` in sync. Version bumps are not enforced by the
repository's pre-commit hooks.

Before publishing each new version, the package's `prepublishOnly` script
runs Biome, type checking, tests, and the build.

Published package versions are tagged with each package basename and version:

```text
ts-memoize-v0.1.0
svg-to-png-v0.1.0
```
