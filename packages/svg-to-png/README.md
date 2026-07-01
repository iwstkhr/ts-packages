# svg-to-png

A small browser TypeScript helper for rendering SVG images to PNG.

## Overview

`svgToPng` accepts an SVG string or `SVGSVGElement`, draws it to a browser canvas, and returns a PNG data URL. `svgToPngBlob` uses the same rendering path and returns a PNG `Blob`.

This package uses browser DOM, `Image`, and Canvas APIs. It does not include a server-side SVG renderer, so Node.js usage requires a browser-like rendering environment.

## Usage

This package is published to GitHub Packages. Configure the package scope before installing:

```ini
@iwstkhr:registry=https://npm.pkg.github.com/
```

For private package access, authenticate npm with a GitHub token that can read packages.

Install the package:

```sh
npm install @iwstkhr/svg-to-png
```

```ts
import { svgToPng } from '@iwstkhr/svg-to-png';

const svg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="40"/></svg>';
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

Renders SVG to PNG and returns a PNG data URL.

- `input`: SVG markup string or `SVGSVGElement`
- `options.backgroundColor`: optional canvas background fill before drawing the SVG
- `options.height`: optional output source height. Defaults to the SVG `height` or `viewBox` height
- `options.quality`: optional encoder quality argument passed to `canvas.toBlob`
- `options.scale`: optional pixel output scale. Defaults to `1`
- `options.width`: optional output source width. Defaults to the SVG `width` or `viewBox` width

The final canvas size is `width * scale` by `height * scale`.

### `svgToPngBlob(input, options?)`

Renders SVG to PNG and returns a PNG `Blob`.

### `svgToDataUrl(svg)`

Encodes SVG markup as an SVG image data URL.

## Development

From the repository root, install dependencies:

```sh
npm ci
```

Run the package checks through npm workspaces:

```sh
npm run check
npm run typecheck
npm test
npm run build
```

Run only this package's test suite:

```sh
npm test --workspace @iwstkhr/svg-to-png
```

Build only this package:

```sh
npm run build --workspace @iwstkhr/svg-to-png
```
