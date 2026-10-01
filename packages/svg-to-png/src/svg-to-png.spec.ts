import { afterEach, describe, expect, test, vi } from 'vitest';
import { svgToDataUrl, svgToPng, svgToPngBlob } from './svg-to-png.js';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('svgToDataUrl', () => {
  test('encodes SVG markup as an image data URL', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><text>Hi</text></svg>';
    const dataUrl = svgToDataUrl(svg);
    const payload = dataUrl.slice(dataUrl.indexOf(',') + 1);

    expect(dataUrl.startsWith('data:image/svg+xml;charset=utf-8,')).toBe(true);
    expect(decodeURIComponent(payload)).toBe(svg);
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

describe('canvas dimensions', () => {
  test.each([
    { width: 0.1, height: 1 },
    { width: 1, height: 0.1 },
    { width: 1, height: 1, scale: 0.1 },
    { width: Number.MAX_VALUE, height: 1, scale: 2 },
    { width: 1, height: Number.MAX_VALUE, scale: 2 },
  ])(
    'rejects invalid pixel dimensions for %o before creating a canvas',
    async (options) => {
      const createElement = vi.fn();
      vi.stubGlobal('Image', class Image {});
      vi.stubGlobal('document', { createElement });

      await expect(svgToPngBlob('<svg></svg>', options)).rejects.toThrow(
        /Canvas (width|height) must be finite and at least 1 pixel/,
      );
      expect(createElement).not.toHaveBeenCalled();
    },
  );
});
