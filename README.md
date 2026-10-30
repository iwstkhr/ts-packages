# ts-packages monorepo

> [!NOTE]
> This repository is for personal use. The packages are maintained for the author's own projects, and no support or compatibility guarantees are provided.

This repository is a pnpm workspaces monorepo for small TypeScript libraries, with tasks orchestrated by [Turborepo](https://turborepo.com/).

## Packages

- [`@iwstkhr/ts-memoize`](./packages/ts-memoize): A small TypeScript memoization helper for caching the most recent function call.
- [`@iwstkhr/svg-to-png`](./packages/svg-to-png): A small browser TypeScript helper for rendering SVG images to PNG.

## Requirements

- Node.js, pnpm, lefthook, and the tools its Git hooks run, specified in [`mise.toml`](./mise.toml)

Use [mise](https://mise.jdx.dev/) to install the specified tools:

```sh
mise install
```

## Development

Install dependencies and enable git hooks:

```sh
pnpm install
lefthook install
```

[`lefthook.yml`](./lefthook.yml) loads the shared hooks from [shared-config](https://github.com/iwstkhr/shared-config), which run on commit (EditorConfig, yamllint, actionlint, Biome, gitleaks, rumdl, Semgrep, shellcheck, Trivy) and check the commit message with Cocogitto.

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

Run every pre-commit hook against all files:

```sh
lefthook run pre-commit --all-files
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
lefthook run pre-commit --all-files
pnpm run check
pnpm run typecheck
pnpm test
pnpm run build
```

## CI

Pull requests and pushes to `main` run the `repo - CI` GitHub Actions workflow:

- Biome
- Type checking
- Tests
- Build

Failures are reported to Slack with the `slack-notify.yml` reusable workflow from [shared-config](https://github.com/iwstkhr/shared-config), using the `SLACK_BOT_TOKEN` and `SLACK_CHANNEL_ID` repository secrets. The `repo - Lefthook` workflow reports its failures the same way.

## Publishing

Packages are published to GitHub Packages, not the public npm registry.

Publishing runs from `.github/workflows/publish.yml` after the `repo - CI` workflow succeeds on `main`. The workflow can also be started manually from GitHub Actions.

The workflow reports to Slack when it publishes new versions, when publishing or tagging fails, and on every manual run.

The workflow skips package versions that are already published. To release changes to a package, update its version in `packages/<package>/package.json` and keep `pnpm-lock.yaml` in sync. Version bumps are not enforced by the repository's Git hooks.

Before publishing each new version, the package's `prepublishOnly` script runs Biome, type checking, tests, and the build.

Published package versions are tagged with each package basename and version:

```text
ts-memoize-v0.1.0
svg-to-png-v0.1.0
```
