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

  const testTargets =
    state.packages.length > 0
      ? state.packages
          .map((pkg) => `- packages/${pkg}/src/*.spec.ts`)
          .join('\n')
      : '- 該当パッケージのテストファイル';

  const docTargets =
    state.packages.length > 0
      ? state.packages.map((pkg) => `- packages/${pkg}/README.md`).join('\n')
      : '- README.md';

  return [
    'ソースコードの変更が検出されました。関連する更新を完了してください。',
    '',
    `変更ファイル:\n${relativeFiles.map((file) => `- ${file}`).join('\n')}`,
    '',
    `対象パッケージ: ${packages}`,
    '',
    '以下を必ず確認・更新してください:',
    '',
    '1. テストコード更新',
    testTargets,
    '- 変更内容を反映し、`npm test` が通ることを確認',
    '',
    '2. GitHub Actions 更新',
    '- .github/workflows/check.yml',
    '- .github/workflows/publish.yml',
    '- ビルド・テスト・公開手順に影響があればワークフローを更新',
    '',
    '3. ドキュメント更新',
    docTargets,
    '- README.md（ルート）',
    '- API 変更・利用方法の変更があれば記載を更新',
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
