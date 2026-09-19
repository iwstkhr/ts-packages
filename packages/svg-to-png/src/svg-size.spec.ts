import { afterEach, describe, expect, test, vi } from 'vitest';
import {
  parseSvgLength,
  parseViewBox,
  readSvgSize,
  resolveScale,
  resolveSvgSize,
} from './svg-size.js';

afterEach(() => {
  vi.unstubAllGlobals();
});

function stubDomParser(attributes: Record<string, string | null>) {
  const parseFromString = vi.fn(() => ({
    documentElement: {
      getAttribute: (name: string) => attributes[name] ?? null,
    },
  }));

  vi.stubGlobal(
    'DOMParser',
    class {
      parseFromString = parseFromString;
    },
  );

  return parseFromString;
}

describe('parseSvgLength', () => {
  test('returns undefined for null or non-numeric values', () => {
    expect(parseSvgLength(null)).toBeUndefined();
    expect(parseSvgLength('')).toBeUndefined();
    expect(parseSvgLength('auto')).toBeUndefined();
  });

  test('reads the leading number from a length string', () => {
    expect(parseSvgLength('100')).toBe(100);
    expect(parseSvgLength(' 12.5px ')).toBe(12.5);
    expect(parseSvgLength('100%')).toBe(100);
  });
});

describe('parseViewBox', () => {
  test('returns undefined for missing or invalid viewBox values', () => {
    expect(parseViewBox(null)).toBeUndefined();
    expect(parseViewBox('0 0')).toBeUndefined();
    expect(parseViewBox('not a viewBox')).toBeUndefined();
  });

  test('reads width and height from space or comma separated viewBox values', () => {
    expect(parseViewBox('0 0 100 50')).toEqual({ width: 100, height: 50 });
    expect(parseViewBox('0,0,80,40')).toEqual({ width: 80, height: 40 });
  });
});

describe('resolveScale', () => {
  test('defaults to 1', () => {
    expect(resolveScale()).toBe(1);
  });

  test('rejects non-positive scales', () => {
    expect(() => resolveScale(0)).toThrow('scale must be greater than 0.');
    expect(() => resolveScale(-2)).toThrow('scale must be greater than 0.');
  });
});

describe('resolveSvgSize', () => {
  test('uses explicit width and height without parsing the SVG string', () => {
    expect(resolveSvgSize('<svg></svg>', { width: 10, height: 20 })).toEqual({
      width: 10,
      height: 20,
    });
  });

  test('throws when the resolved size is not greater than 0', () => {
    expect(() =>
      resolveSvgSize('<svg></svg>', { width: 0, height: 10 }),
    ).toThrow('SVG width must be greater than 0.');
    expect(() =>
      resolveSvgSize('<svg></svg>', { width: 10, height: -1 }),
    ).toThrow('SVG height must be greater than 0.');
  });

  test('parses an SVG string once when width or height is missing', () => {
    const parseFromString = stubDomParser({
      width: '10',
      height: '20',
      viewBox: '0 0 100 50',
    });

    expect(resolveSvgSize('<svg></svg>')).toEqual({ width: 10, height: 20 });
    expect(parseFromString).toHaveBeenCalledTimes(1);
  });

  test('falls back to viewBox when width or height attributes are missing', () => {
    stubDomParser({
      width: null,
      height: null,
      viewBox: '0 0 80 40',
    });

    expect(resolveSvgSize('<svg></svg>')).toEqual({ width: 80, height: 40 });
  });

  test('fills only the missing dimension from the SVG', () => {
    stubDomParser({
      width: '30',
      height: '40',
      viewBox: null,
    });

    expect(resolveSvgSize('<svg></svg>', { width: 12 })).toEqual({
      width: 12,
      height: 40,
    });
  });
});

describe('readSvgSize', () => {
  test('reads width and height from an SVG element', () => {
    const input = {
      width: { baseVal: { value: 10 } },
      height: { baseVal: { value: 20 } },
      viewBox: { baseVal: { width: 100, height: 200 } },
    } as SVGSVGElement;

    expect(readSvgSize(input)).toEqual({ width: 10, height: 20 });
  });

  test('falls back to viewBox when element width or height is 0', () => {
    const input = {
      width: { baseVal: { value: 0 } },
      height: { baseVal: { value: 0 } },
      viewBox: { baseVal: { width: 100, height: 50 } },
    } as SVGSVGElement;

    expect(readSvgSize(input)).toEqual({ width: 100, height: 50 });
  });
});
