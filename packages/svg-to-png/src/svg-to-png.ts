export type SvgInput = string | SVGSVGElement;

export type SvgToPngOptions = {
  backgroundColor?: string;
  height?: number;
  quality?: number;
  scale?: number;
  width?: number;
};

export type SvgSize = {
  height: number;
  width: number;
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
  const scale = options.scale ?? 1;

  if (scale <= 0) {
    throw new Error('scale must be greater than 0.');
  }

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);

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

function resolveSvgSize(input: SvgInput, options: SvgToPngOptions): SvgSize {
  let width = options.width;
  let height = options.height;

  if (width === undefined || height === undefined) {
    const size = readSvgSize(input);
    width ??= size.width;
    height ??= size.height;
  }

  if (width <= 0) {
    throw new Error('SVG width must be greater than 0.');
  }

  if (height <= 0) {
    throw new Error('SVG height must be greater than 0.');
  }

  return { width, height };
}

function readSvgSize(input: SvgInput): SvgSize {
  if (typeof input === 'string') {
    return readSvgSizeFromString(input);
  }

  return {
    width: input.width.baseVal.value || input.viewBox.baseVal.width,
    height: input.height.baseVal.value || input.viewBox.baseVal.height,
  };
}

function readSvgSizeFromString(svg: string): SvgSize {
  if (typeof DOMParser === 'undefined') {
    throw new Error(
      'SVG strings require DOMParser support. Pass width and height options in non-browser environments.',
    );
  }

  const document = new DOMParser().parseFromString(svg, 'image/svg+xml');
  const svgElement = document.documentElement;
  const viewBox = parseViewBox(svgElement.getAttribute('viewBox'));

  return {
    width:
      parseSvgLength(svgElement.getAttribute('width')) ?? viewBox?.width ?? 0,
    height:
      parseSvgLength(svgElement.getAttribute('height')) ?? viewBox?.height ?? 0,
  };
}

function parseSvgLength(value: string | null) {
  if (value === null) {
    return undefined;
  }

  const match = value.trim().match(/^(\d+(?:\.\d+)?)/);
  if (match === null) {
    return undefined;
  }

  return Number(match[1]);
}

function parseViewBox(value: string | null) {
  if (value === null) {
    return undefined;
  }

  const [, , width, height] = value
    .trim()
    .split(/\s+|,/)
    .map((part) => Number(part));

  if (!Number.isFinite(width) || !Number.isFinite(height)) {
    return undefined;
  }

  return { width, height };
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
  if (
    typeof document === 'undefined' ||
    typeof Image === 'undefined' ||
    typeof FileReader === 'undefined'
  ) {
    throw new Error(
      'svgToPng requires a browser environment with Canvas APIs.',
    );
  }
}
