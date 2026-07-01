# ts-memoize

A small TypeScript memoization helper for caching the most recent function call.

## Overview

`memoize` wraps a function and stores the result from the latest argument set. When the wrapped function is called again with the same arguments, the cached value is returned instead of calling the original function again.

Arguments are compared with `JSON.stringify(args)`, so this helper is best suited for simple JSON-serializable arguments.

## Usage

Configure the package scope for GitHub Packages:

```ini
@iwstkhr:registry=https://npm.pkg.github.com/
```

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

Install dependencies:

```sh
npm install
```

Run tests:

```sh
npm test
```

Run type checking:

```sh
npm run typecheck
```

Build the package:

```sh
npm run build
```
