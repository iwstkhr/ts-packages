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

function stubRendering() {
  const png = new Blob(['png'], { type: 'image/png' });
  const context = {
    fillStyle: '',
    fillRect: vi.fn(),
    drawImage: vi.fn(),
  };
  const canvas = {
    width: 0,
    height: 0,
    getContext: vi.fn((): typeof context | null => context),
    toBlob: vi.fn(
      (callback: BlobCallback, _type: string, _quality?: number) => {
        callback(png);
      },
    ),
  };
  const createElement = vi.fn(() => canvas);
  const images: StubImage[] = [];
  let imageFails = false;
  class StubImage extends EventTarget {
    source = '';
    constructor() {
      super();
      images.push(this);
    }
    set src(value: string) {
      this.source = value;
      queueMicrotask(() =>
        this.dispatchEvent(new Event(imageFails ? 'error' : 'load')),
      );
    }
  }
  vi.stubGlobal('Image', StubImage);
  vi.stubGlobal('document', { createElement });
  return {
    png,
    context,
    canvas,
    createElement,
    images,
    failImage: () => {
      imageFails = true;
    },
  };
}

function stubFileReader(error: DOMException | null = null) {
  const readAsDataURL = vi.fn();
  class StubFileReader extends EventTarget {
    result: string | null = null;
    error = error;
    readAsDataURL(blob: Blob) {
      readAsDataURL(blob);
      this.result = error === null ? 'data:image/png;base64,cG5n' : null;
      queueMicrotask(() =>
        this.dispatchEvent(new Event(error === null ? 'load' : 'error')),
      );
    }
  }
  vi.stubGlobal('FileReader', StubFileReader);
  return readAsDataURL;
}

const svg = '<svg width="10" height="20"></svg>';
const dimensions = { width: 10, height: 20 };

describe('PNG rendering', () => {
  test('renders the SVG and returns the encoded PNG blob without FileReader', async () => {
    const { canvas, context, png, images, createElement } = stubRendering();
    vi.stubGlobal('FileReader', undefined);

    await expect(svgToPngBlob(svg, dimensions)).resolves.toBe(png);

    expect(createElement).toHaveBeenCalledWith('canvas');
    expect(canvas.width).toBe(10);
    expect(canvas.height).toBe(20);
    expect(canvas.getContext).toHaveBeenCalledWith('2d');
    expect(images[0]?.source).toBe(svgToDataUrl(svg));
    expect(context.drawImage).toHaveBeenCalledWith(images[0], 0, 0, 10, 20);
    expect(context.fillRect).not.toHaveBeenCalled();
    expect(canvas.toBlob).toHaveBeenCalledWith(
      expect.any(Function),
      'image/png',
      undefined,
    );
  });

  test('rounds scaled dimensions and fills the background before drawing', async () => {
    const { canvas, context, images } = stubRendering();

    await svgToPngBlob(svg, {
      width: 10.2,
      height: 20.4,
      scale: 2,
      backgroundColor: 'white',
      quality: 0.8,
    });

    expect(canvas.width).toBe(20);
    expect(canvas.height).toBe(41);
    expect(context.fillStyle).toBe('white');
    expect(context.fillRect).toHaveBeenCalledWith(0, 0, 20, 41);
    expect(context.drawImage).toHaveBeenCalledWith(images[0], 0, 0, 20, 41);
    expect(context.fillRect.mock.invocationCallOrder[0]).toBeLessThan(
      context.drawImage.mock.invocationCallOrder[0] ?? 0,
    );
    expect(canvas.toBlob).toHaveBeenCalledWith(
      expect.any(Function),
      'image/png',
      0.8,
    );
  });

  test('serializes SVG element input before loading the image', async () => {
    const { images } = stubRendering();
    const input = {} as SVGSVGElement;
    const serializeToString = vi.fn(() => svg);
    vi.stubGlobal(
      'XMLSerializer',
      class {
        serializeToString = serializeToString;
      },
    );

    await svgToPngBlob(input, dimensions);

    expect(serializeToString).toHaveBeenCalledWith(input);
    expect(images[0]?.source).toBe(svgToDataUrl(svg));
  });

  test('rejects when the 2D canvas context is unavailable', async () => {
    const { canvas } = stubRendering();
    canvas.getContext.mockReturnValue(null);

    await expect(svgToPngBlob(svg, dimensions)).rejects.toThrow(
      'Failed to create a 2D canvas context.',
    );
    expect(canvas.toBlob).not.toHaveBeenCalled();
  });

  test('rejects when the SVG image cannot be loaded', async () => {
    const { failImage, context, canvas } = stubRendering();
    failImage();

    await expect(svgToPngBlob(svg, dimensions)).rejects.toThrow(
      'Failed to load the SVG image.',
    );
    expect(context.drawImage).not.toHaveBeenCalled();
    expect(canvas.toBlob).not.toHaveBeenCalled();
  });

  test('rejects when PNG encoding returns null', async () => {
    const { canvas } = stubRendering();
    canvas.toBlob.mockImplementation((callback) => callback(null));

    await expect(svgToPngBlob(svg, dimensions)).rejects.toThrow(
      'Failed to convert the canvas to a PNG blob.',
    );
  });

  test('converts the PNG blob to a data URL', async () => {
    const { png } = stubRendering();
    const readAsDataURL = stubFileReader();

    await expect(svgToPng(svg, dimensions)).resolves.toBe(
      'data:image/png;base64,cG5n',
    );
    expect(readAsDataURL).toHaveBeenCalledWith(png);
  });

  test('rejects when FileReader is unavailable for data URL conversion', async () => {
    stubRendering();
    vi.stubGlobal('FileReader', undefined);

    await expect(svgToPng(svg, dimensions)).rejects.toThrow(
      'svgToPng requires FileReader to convert a PNG blob to a data URL.',
    );
  });

  test('propagates FileReader errors', async () => {
    stubRendering();
    const error = new DOMException('read failed', 'NotReadableError');
    stubFileReader(error);

    await expect(svgToPng(svg, dimensions)).rejects.toBe(error);
  });
});
