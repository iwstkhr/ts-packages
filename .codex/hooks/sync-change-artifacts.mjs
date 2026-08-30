#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const STATE_PATH = fileURLToPath(
  new URL('./.pending-source-edits.json', import.meta.url),
);
const PROJECT_ROOT = fileURLToPath(new URL('../../', import.meta.url)).replace(
  /\/$/,
  '',
);
const SKILL_NAME = 'sync-change-artifacts';
const SKILL_PATH = `.agents/skills/${SKILL_NAME}/SKILL.md`;

function isSourceCodeEdit(relativePath) {
  if (/\.(spec|test)\.[cm]?tsx?$/.test(relativePath)) {
    return false;
  }

  if (relativePath.startsWith('.github/')) {
    return false;
  }

  if (/\.md$/i.test(relativePath)) {
    return false;
  }

  if (/^packages\/[^/]+\/src\/[^/]+\.[cm]?tsx?$/.test(relativePath)) {
    return true;
  }

  if (/^scripts\/.+\.[cm]?[jt]s$/.test(relativePath)) {
    return true;
  }

  return false;
}

function packageNameFromPath(relativePath) {
  const match = relativePath.match(/^packages\/([^/]+)\//);
  return match?.[1] ?? null;
}

// Paths of every file that differs from HEAD, including untracked ones.
// `-z` keeps paths raw (no shell quoting) and NUL-separates the records.
function changedPaths() {
  const output = execFileSync(
    'git',
    ['status', '--porcelain=v1', '-z', '--untracked-files=all'],
    { cwd: PROJECT_ROOT, encoding: 'utf8' },
  );
  const records = output.split('\0');
  const paths = [];

  for (let index = 0; index < records.length; index += 1) {
    const record = records[index];
    if (record.length < 4) {
      continue;
    }

    const status = record.slice(0, 2);
    paths.push(record.slice(3));

    // Renames and copies carry the original path in the next record.
    if (status.startsWith('R') || status.startsWith('C')) {
      index += 1;
    }
  }

  return paths;
}

function readNotified() {
  try {
    const state = JSON.parse(readFileSync(STATE_PATH, 'utf8'));
    return new Set(state.files ?? []);
  } catch {
    return new Set();
  }
}

function writeNotified(files) {
  mkdirSync(dirname(STATE_PATH), { recursive: true });
  writeFileSync(
    STATE_PATH,
    `${JSON.stringify({ files: [...files].sort() }, null, 2)}\n`,
    'utf8',
  );
}

function buildReason(files, packages) {
  const target =
    packages.length > 0 ? packages.join(', ') : '(ルート / scripts)';

  return [
    `ソースコードの変更が検出されました。\`${SKILL_NAME}\` スキルを実行してください。`,
    '',
    `変更ファイル:\n${files.map((file) => `- ${file}`).join('\n')}`,
    '',
    `対象パッケージ: ${target}`,
    '',
    `まず ${SKILL_PATH} を読み、チェックリストに従って関連成果物を更新してください。`,
    'スキルの手順をすべて完了するまで続行してください。',
  ].join('\n');
}

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  input += chunk;
});
process.stdin.on('end', () => {
  try {
    const payload = JSON.parse(input);

    // The turn was already continued by this hook; do not loop again.
    if (payload.stop_hook_active) {
      process.stdout.write('{}\n');
      process.exit(0);
    }

    const files = changedPaths().filter(isSourceCodeEdit).sort();
    const notified = readNotified();

    if (files.length === 0) {
      process.stdout.write('{}\n');
      process.exit(0);
    }

    // Only prompt once per file, so a still-dirty tree does not nag every turn.
    if (files.every((file) => notified.has(file))) {
      process.stdout.write('{}\n');
      process.exit(0);
    }

    const packages = [
      ...new Set(files.map(packageNameFromPath).filter(Boolean)),
    ].sort();

    writeNotified(new Set([...notified, ...files]));

    process.stdout.write(
      `${JSON.stringify({ decision: 'block', reason: buildReason(files, packages) })}\n`,
    );
  } catch {
    process.stdout.write('{}\n');
    process.exit(0);
  }
});
