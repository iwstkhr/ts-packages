# ts-memoize

A small TypeScript memoization helper for caching the most recent function call.

## Overview

`memoize` wraps a function and stores the result from the latest argument set. When the wrapped function is called again with the same arguments, the cached value is returned instead of calling the original function again.

Arguments are compared with `JSON.stringify(args)`, so this helper is best suited for simple JSON-serializable arguments.

## Usage

This package is published to GitHub Packages. Configure the package scope before installing:

```ini
@iwstkhr:registry=https://npm.pkg.github.com/
```

For private package access, authenticate npm with a GitHub token that can read packages.

Install the package:

```sh
npm install @iwstkhr/ts-memoize
```

```ts
import { memoize } from '@iwstkhr/ts-memoize';

function add(a: number, b: number): number {
  console.info('running add');
  return a + b;
}

const memoizedAdd = memoize(add);

memoizedAdd(1, 2); // Calls add and returns 3
memoizedAdd(1, 2); // Returns cached 3
memoizedAdd(2, 3); // Calls add and returns 5
```

The helper preserves the wrapped function's parameter and return types:

```ts
const memoized = memoize((name: string) => `Hello, ${name}`);

const message: string = memoized('TypeScript');
```

## Behavior

- Only the most recent call is cached.
- Different arguments replace the previous cache entry.
- Promise-returning functions are cached by promise value.
- Arguments must be safely serializable with `JSON.stringify`.

## Development

From the repository root, install dependencies:

```sh
npm ci
```

Run the package checks through npm workspaces:

```sh
npm run check
npm run typecheck
npm test
npm run build
```

Run only this package's test suite:

```sh
npm test --workspace @iwstkhr/ts-memoize
```

Build only this package:

```sh
npm run build --workspace @iwstkhr/ts-memoize
```

When changing files in this package, update the package version in `package.json`. The repository enforces this with pre-commit and agent hooks.
