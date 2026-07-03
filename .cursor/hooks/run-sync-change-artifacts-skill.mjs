#!/usr/bin/env node

import { readFileSync, unlinkSync } from 'node:fs';
import { relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const STATE_PATH = fileURLToPath(
  new URL('./.pending-source-edits.json', import.meta.url),
);
const PROJECT_ROOT = fileURLToPath(new URL('../../', import.meta.url)).replace(
  /\/$/,
  '',
);
const SKILL_PATH = '.cursor/skills/sync-change-artifacts/SKILL.md';

function readState() {
  try {
    return JSON.parse(readFileSync(STATE_PATH, 'utf8'));
  } catch {
    return null;
  }
}

function clearState() {
  try {
    unlinkSync(STATE_PATH);
  } catch {
    // no pending state
  }
}

function buildFollowupMessage(state) {
  const relativeFiles = state.files.map((file) => relative(PROJECT_ROOT, file));
  const packages =
    state.packages.length > 0
      ? state.packages.join(', ')
      : '(ルート / scripts)';

  return [
    'ソースコードの変更が検出されました。`sync-change-artifacts` スキルを実行してください。',
    '',
    `変更ファイル:\n${relativeFiles.map((file) => `- ${file}`).join('\n')}`,
    '',
    `対象パッケージ: ${packages}`,
    '',
    `まず @${SKILL_PATH} を読み、チェックリストに従って関連成果物を更新してください。`,
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

    if (payload.status !== 'completed') {
      process.stdout.write('{}\n');
      process.exit(0);
    }

    const state = readState();
    if (!state?.files?.length) {
      process.stdout.write('{}\n');
      process.exit(0);
    }

    const followupMessage = buildFollowupMessage(state);
    clearState();

    process.stdout.write(
      `${JSON.stringify({ followup_message: followupMessage })}\n`,
    );
  } catch {
    process.stdout.write('{}\n');
    process.exit(0);
  }
});
