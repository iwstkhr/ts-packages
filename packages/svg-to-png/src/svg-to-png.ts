import { resolveScale, resolveSvgSize, type SvgInput } from './svg-size.js';

export type { SvgInput, SvgSize } from './svg-size.js';

export type SvgToPngOptions = {
  backgroundColor?: string;
  height?: number;
  quality?: number;
  scale?: number;
  width?: number;
};

export async function svgToPng(input: SvgInput, options: SvgToPngOptions = {}) {
  const blob = await svgToPngBlob(input, options);
  return blobToDataUrl(blob);
}

export async function svgToPngBlob(
  input: SvgInput,
  options: SvgToPngOptions = {},
) {
  assertBrowserSupport();

  const svg = serializeSvg(input);
  const { width, height } = resolveSvgSize(input, options);
  const scale = resolveScale(options.scale);

  const canvasWidth = Math.round(width * scale);
  const canvasHeight = Math.round(height * scale);
  if (!Number.isFinite(canvasWidth) || canvasWidth <= 0) {
    throw new Error('Canvas width must be finite and at least 1 pixel.');
  }
  if (!Number.isFinite(canvasHeight) || canvasHeight <= 0) {
    throw new Error('Canvas height must be finite and at least 1 pixel.');
  }

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const context = canvas.getContext('2d');
  if (context === null) {
    throw new Error('Failed to create a 2D canvas context.');
  }

  if (options.backgroundColor !== undefined) {
    context.fillStyle = options.backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  const image = await loadImage(svgToDataUrl(svg));
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  return canvasToBlob(canvas, options.quality);
}

export function svgToDataUrl(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function serializeSvg(input: SvgInput) {
  if (typeof input === 'string') {
    return input;
  }

  return new XMLSerializer().serializeToString(input);
}

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();

    image.addEventListener('load', () => resolve(image), { once: true });
    image.addEventListener(
      'error',
      () => reject(new Error('Failed to load the SVG image.')),
      { once: true },
    );

    image.src = source;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, quality?: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob === null) {
          reject(new Error('Failed to convert the canvas to a PNG blob.'));
          return;
        }

        resolve(blob);
      },
      'image/png',
      quality,
    );
  });
}

function blobToDataUrl(blob: Blob) {
  if (typeof FileReader === 'undefined') {
    throw new Error(
      'svgToPng requires FileReader to convert a PNG blob to a data URL.',
    );
  }

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener('load', () => resolve(String(reader.result)), {
      once: true,
    });
    reader.addEventListener('error', () => reject(reader.error), {
      once: true,
    });

    reader.readAsDataURL(blob);
  });
}

function assertBrowserSupport() {
  if (typeof document === 'undefined' || typeof Image === 'undefined') {
    throw new Error(
      'svgToPng requires a browser environment with document and Image APIs.',
    );
  }
}
