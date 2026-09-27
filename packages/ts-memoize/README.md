# ts-memoize

A small TypeScript memoization helper for caching the most recent function call.

> [!NOTE]
> This package is for personal use. No support or compatibility guarantees are provided.

## Overview

`memoize` wraps a function and stores the result from the latest argument set. When the wrapped function is called again with the same arguments, the cached value is returned instead of calling the original function again.

Arguments are compared with a JSON-based serializer that distinguishes `undefined`, `null`, `NaN`, and infinite numbers. The helper is still best suited for simple JSON-serializable arguments.

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
- Promise-returning functions reuse the same promise for matching arguments, including while it is pending. Once a rejection is handled, that promise is dropped from the cache so the next call runs again. A rejection from an older call does not clear a newer cache entry.
- Synchronous exceptions are not cached; the previous cache entry is retained.
- `undefined`, `null`, `NaN`, and infinite numbers are distinct cache keys.
- Arguments must still be serializable with `JSON.stringify` (for example, no circular references or `BigInt` values).

Comparison uses serialized values, not object identity or general deep equality. Property order can affect the key, and values such as functions, symbols, `Map`, and `Set` are not distinguished reliably. Avoid objects with the reserved `__tsMemoizeType` property: they can collide with the markers used for `undefined`, `NaN`, `Infinity`, and `-Infinity`.

The wrapper does not forward a method's `this` receiver. Bind methods before passing them to `memoize` if they depend on `this`.

## Development

From the repository root, install dependencies:

```sh
pnpm install
```

Run the package checks through Turborepo:

```sh
pnpm run check
pnpm run typecheck
pnpm test
pnpm run build
```

Run only this package's test suite:

```sh
pnpm --filter @iwstkhr/ts-memoize test
```

Build only this package:

```sh
pnpm --filter @iwstkhr/ts-memoize run build
```

For release and versioning instructions, see [Publishing](../../README.md#publishing) in the repository README.
