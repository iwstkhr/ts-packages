# svg-to-png

A small browser TypeScript helper for rendering SVG images to PNG.

## Overview

`svgToPng` accepts an SVG string or `SVGSVGElement`, draws it to a browser
canvas, and returns a PNG data URL. `svgToPngBlob` uses the same rendering
path and returns a PNG `Blob`.

This package uses browser `document`, `Image`, and Canvas APIs.
`svgToPng` also needs `FileReader` to return a PNG data URL.
`svgToPngBlob` does not. It does not include a server-side SVG renderer, so
Node.js usage requires a browser-like rendering environment.

SVG strings also require `DOMParser` unless both `width` and `height` are
provided in the options. SVG elements require `XMLSerializer`.

## Usage

This package is published to GitHub Packages. Configure the package scope
before installing:

```ini
@iwstkhr:registry=https://npm.pkg.github.com/
```

For private package access, authenticate npm with a GitHub token that can
read packages.

Install the package:

```sh
npm install @iwstkhr/svg-to-png
```

```ts
import { svgToPng } from '@iwstkhr/svg-to-png';

const svg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">' +
  '<circle cx="50" cy="50" r="40"/></svg>';
const png = await svgToPng(svg, {
  backgroundColor: 'white',
  scale: 2,
});

const image = document.createElement('img');
image.src = png;
document.body.append(image);
```

## API

### `svgToPng(input, options?)`

Renders SVG to PNG and returns `Promise<string>` containing a PNG data URL.

- `input`: SVG markup string or `SVGSVGElement`
- `options.backgroundColor`: optional canvas background fill before drawing
  the SVG
- `options.height`: optional output source height. Defaults to the SVG
  `height` or `viewBox` height
- `options.quality`: optional encoder quality argument passed to
  `canvas.toBlob`
- `options.scale`: optional pixel output scale. Defaults to `1`
- `options.width`: optional output source width. Defaults to the SVG `width`
  or `viewBox` width

The final canvas size is `Math.round(width * scale)` by
`Math.round(height * scale)`.

Width and height are resolved independently: an explicit option takes
precedence, then the SVG dimension, then the corresponding `viewBox`
dimension. Setting only one dimension does not automatically calculate the
other from the aspect ratio. For SVG strings, dimension attributes use their
leading numeric value; units and percentages are not converted (for example,
`100%` is read as `100`). For SVG elements, the browser's `baseVal.value` is
used, with a `viewBox` fallback when it is zero.

Resolved dimensions and `scale` must be greater than zero; non-positive
values reject the promise. Rendering also rejects if the browser APIs are
unavailable, the SVG image fails to load, the 2D context cannot be created,
or PNG encoding fails.

### `svgToPngBlob(input, options?)`

Renders SVG to PNG and returns `Promise<Blob>`. It accepts the same input and
options as `svgToPng`. This path does not use `FileReader`.

### `svgToDataUrl(svg)`

Encodes an SVG markup string as an SVG image data URL and returns it
synchronously. This helper does not require browser APIs or validate the SVG.

### Types

The package exports `SvgInput` (`string | SVGSVGElement`), `SvgSize`
(`{ height: number; width: number }`), and `SvgToPngOptions` for TypeScript
consumers.

## Development

From the repository root, install dependencies:

```sh
pnpm install
```

Run the package checks through Turborepo:

```sh
pnpm run check
pnpm run typecheck
pnpm test
pnpm run build
```

Run only this package's test suite:

```sh
pnpm --filter @iwstkhr/svg-to-png test
```

Build only this package:

```sh
pnpm --filter @iwstkhr/svg-to-png run build
```

For release and versioning instructions, see
[Publishing](../../README.md#publishing) in the repository README.
