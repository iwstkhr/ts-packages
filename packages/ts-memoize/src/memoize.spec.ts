import { afterEach, describe, expect, test, vi } from 'vitest';
import { memoize } from './memoize.js';

/** Setup */
afterEach(() => {
  vi.clearAllMocks();
});

describe('memoize', () => {
  describe('When normal function', () => {
    const add = vi.fn((a: number, b: number) => {
      return a + b;
    });

    test('At the first time call, should return an actual value', async () => {
      const memoizedAdd = memoize(add);
      expect(memoizedAdd(1, 2)).toBe(3);
      expect(add.mock.calls).toHaveLength(1);
    });

    test('At the second time call, should return the cached value', async () => {
      const memoizedAdd = memoize(add);
      expect(memoizedAdd(1, 2)).toBe(3);
      expect(memoizedAdd(1, 2)).toBe(3);
      expect(add.mock.calls).toHaveLength(1);
    });

    test('When the arguments are changed, should return an actual value', async () => {
      const memoizedAdd = memoize(add);
      expect(memoizedAdd(1, 2)).toBe(3);
      expect(memoizedAdd(3, 4)).toBe(7);
      expect(add.mock.calls).toHaveLength(2);
    });
  });

  describe('When promise function', () => {
    const add = vi.fn(async (a: number, b: number) => {
      return a + b;
    });

    test('At the first time call, should return an actual value', async () => {
      const memoizedAdd = memoize(add);
      expect(await memoizedAdd(1, 2)).toBe(3);
      expect(add.mock.calls).toHaveLength(1);
    });

    test('At the second time call, should return the cached value', async () => {
      const memoizedAdd = memoize(add);
      expect(await memoizedAdd(1, 2)).toBe(3);
      expect(await memoizedAdd(1, 2)).toBe(3);
      expect(add.mock.calls).toHaveLength(1);
    });

    test('When the arguments are changed, should return an actual value', async () => {
      const memoizedAdd = memoize(add);
      expect(await memoizedAdd(1, 2)).toBe(3);
      expect(await memoizedAdd(3, 4)).toBe(7);
      expect(add.mock.calls).toHaveLength(2);
    });
  });

  describe('When a function has no arguments', () => {
    const add = vi.fn(() => {
      return 1 + 2;
    });

    test('At the first time call, should return an actual value', async () => {
      const memoizedAdd = memoize(add);
      expect(memoizedAdd()).toBe(3);
      expect(add.mock.calls).toHaveLength(1);
    });

    test('At the second time call, should return the cached value', async () => {
      const memoizedAdd = memoize(add);
      expect(memoizedAdd()).toBe(3);
      expect(memoizedAdd()).toBe(3);
      expect(add.mock.calls).toHaveLength(1);
    });
  });

  describe('When arguments are not interchangeable in JSON', () => {
    test('does not treat undefined and null as the same arguments', () => {
      const fn = vi.fn((value: unknown) => value);
      const memoized = memoize(fn);

      expect(memoized(undefined)).toBeUndefined();
      expect(memoized(null)).toBeNull();
      expect(fn.mock.calls).toHaveLength(2);
    });

    test('does not treat NaN and null as the same arguments', () => {
      const fn = vi.fn((value: unknown) => value);
      const memoized = memoize(fn);

      expect(Number.isNaN(memoized(Number.NaN))).toBe(true);
      expect(memoized(null)).toBeNull();
      expect(fn.mock.calls).toHaveLength(2);
    });

    test('does not treat Infinity and null as the same arguments', () => {
      const fn = vi.fn((value: unknown) => value);
      const memoized = memoize(fn);

      expect(memoized(Number.POSITIVE_INFINITY)).toBe(Number.POSITIVE_INFINITY);
      expect(memoized(null)).toBeNull();
      expect(fn.mock.calls).toHaveLength(2);
    });

    test('caches repeated undefined arguments', () => {
      const fn = vi.fn((value: unknown) => value);
      const memoized = memoize(fn);

      memoized(undefined);
      memoized(undefined);

      expect(fn.mock.calls).toHaveLength(1);
    });
  });
});
