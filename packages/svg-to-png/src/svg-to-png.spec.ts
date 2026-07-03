import { describe, expect, test } from 'vitest';
import { svgToDataUrl, svgToPng } from './svg-to-png.js';

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
      'svgToPng requires a browser environment with Canvas APIs.',
    );
  });
});
