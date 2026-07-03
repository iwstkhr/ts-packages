#!/usr/bin/env node

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const STATE_PATH = fileURLToPath(
  new URL('./.pending-source-edits.json', import.meta.url),
);
const PROJECT_ROOT = fileURLToPath(new URL('../../', import.meta.url)).replace(
  /\/$/,
  '',
);

function isSourceCodeEdit(filePath) {
  const rel = relative(PROJECT_ROOT, filePath);

  if (rel.startsWith('..')) {
    return false;
  }

  if (/\.(spec|test)\.[cm]?tsx?$/.test(rel)) {
    return false;
  }

  if (rel.startsWith('.github/')) {
    return false;
  }

  if (/\.md$/i.test(rel)) {
    return false;
  }

  if (/^packages\/[^/]+\/src\/[^/]+\.[cm]?tsx?$/.test(rel)) {
    return true;
  }

  if (/^scripts\/.+\.[cm]?[jt]s$/.test(rel)) {
    return true;
  }

  return false;
}

function packageNameFromPath(filePath) {
  const rel = relative(PROJECT_ROOT, filePath);
  const match = rel.match(/^packages\/([^/]+)\//);
  return match?.[1] ?? null;
}

function readState() {
  try {
    return JSON.parse(readFileSync(STATE_PATH, 'utf8'));
  } catch {
    return { files: [], packages: [] };
  }
}

function writeState(state) {
  mkdirSync(dirname(STATE_PATH), { recursive: true });
  state.files = [...new Set(state.files)].sort();
  state.packages = [...new Set(state.packages)].sort();
  writeFileSync(STATE_PATH, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
}

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  input += chunk;
});
process.stdin.on('end', () => {
  try {
    const payload = JSON.parse(input);
    const filePath = payload.file_path;

    if (!filePath || !isSourceCodeEdit(filePath)) {
      process.exit(0);
    }

    const state = readState();
    state.files.push(filePath);

    const packageName = packageNameFromPath(filePath);
    if (packageName) {
      state.packages.push(packageName);
    }

    writeState(state);
  } catch {
    process.exit(0);
  }
});
