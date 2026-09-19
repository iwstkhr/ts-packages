import { afterEach, describe, expect, test, vi } from 'vitest';
import { svgToDataUrl, svgToPng, svgToPngBlob } from './svg-to-png.js';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('svgToDataUrl', () => {
  test('encodes SVG markup as an image data URL', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><text>Hi</text></svg>';

    expect(svgToDataUrl(svg)).toBe(
      `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    );
  });
});

describe('svgToPng', () => {
  test('throws outside a browser environment', async () => {
    await expect(svgToPng('<svg width="1" height="1"></svg>')).rejects.toThrow(
      'svgToPng requires a browser environment with document and Image APIs.',
    );
  });
});

describe('svgToPngBlob', () => {
  test('throws outside a browser environment', async () => {
    await expect(
      svgToPngBlob('<svg width="1" height="1"></svg>'),
    ).rejects.toThrow(
      'svgToPng requires a browser environment with document and Image APIs.',
    );
  });

  test('does not require FileReader', async () => {
    vi.stubGlobal('Image', class Image {});
    vi.stubGlobal('document', {
      createElement: () => {
        throw new Error('canvas create');
      },
    });

    await expect(
      svgToPngBlob('<svg></svg>', { width: 1, height: 1 }),
    ).rejects.toThrow('canvas create');
  });
});
