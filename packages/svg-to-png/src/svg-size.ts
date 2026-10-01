export type SvgInput = string | SVGSVGElement;

export type SvgSize = {
  height: number;
  width: number;
};

export type SvgSizeOptions = {
  height?: number;
  width?: number;
};

export function resolveSvgSize(
  input: SvgInput,
  options: SvgSizeOptions = {},
): SvgSize {
  let width = options.width;
  let height = options.height;

  if (width === undefined || height === undefined) {
    const size = readSvgSize(input);
    width ??= size.width;
    height ??= size.height;
  }

  if (!Number.isFinite(width) || width <= 0) {
    throw new Error('SVG width must be greater than 0.');
  }

  if (!Number.isFinite(height) || height <= 0) {
    throw new Error('SVG height must be greater than 0.');
  }

  return { width, height };
}

export function resolveScale(scale = 1) {
  if (!Number.isFinite(scale) || scale <= 0) {
    throw new Error('scale must be greater than 0.');
  }

  return scale;
}

export function readSvgSize(input: SvgInput): SvgSize {
  if (typeof input === 'string') {
    return readSvgSizeFromString(input);
  }

  return {
    width: input.width.baseVal.value || input.viewBox.baseVal.width,
    height: input.height.baseVal.value || input.viewBox.baseVal.height,
  };
}

export function parseSvgLength(value: string | null) {
  if (value === null) {
    return undefined;
  }

  const match = value.trim().match(/^(\d+(?:\.\d+)?)/);
  if (match === null) {
    return undefined;
  }

  return Number(match[1]);
}

export function parseViewBox(value: string | null) {
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

function readSvgSizeFromString(svg: string): SvgSize {
  if (typeof DOMParser === 'undefined') {
    throw new Error(
      'SVG strings require DOMParser support. Pass width and height options in non-browser environments.',
    );
  }

  const parsed = new DOMParser().parseFromString(svg, 'image/svg+xml');
  const svgElement = parsed.documentElement;
  const viewBox = parseViewBox(svgElement.getAttribute('viewBox'));

  return {
    width:
      parseSvgLength(svgElement.getAttribute('width')) ?? viewBox?.width ?? 0,
    height:
      parseSvgLength(svgElement.getAttribute('height')) ?? viewBox?.height ?? 0,
  };
}
