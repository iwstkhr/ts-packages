---
name: sync-change-artifacts
description: >-
  ソースコード変更時にテスト・GitHub Actions・ドキュメントを同期更新する。
  packages/*/src の実装変更、新機能追加、API 変更、ビルド手順変更時に使用する。
  Use when changing source code, adding features, or modifying package
  behavior.
---

# Code Change Checklist

ソースコード（`packages/*/src/**` や `scripts/**`）を変更したら、実装だけでなく関連成果物も同じ PR で更新する。

`.codex/hooks/` の Stop フックが変更を検出した場合も、このスキルに従う。

## チェックリスト

```
Task Progress:
- [ ] 1. テストコード更新
- [ ] 2. GitHub Actions 更新
- [ ] 3. ドキュメント更新
- [ ] 4. 検証（npm run check / typecheck / test / build）
```

## 1. テストコード更新

**対象**: 変更したパッケージの `packages/<pkg>/src/*.spec.ts`

| 変更内容 | テストで確認すること |
|---------|-------------------|
| 新しい関数・メソッド | 正常系・主要な異常系を追加 |
| 既存 API の挙動変更 | 期待値・ケース名を更新 |
| 削除・非推奨化 | 不要テストを削除し、残すテストを整合 |
| バグ修正 | 再発防止の回帰テストを追加 |

**規約**:

- Vitest（`describe` / `test` / `expect` / `vi`）
- テストファイルはソースと同じ `src/` 配下、`* .spec.ts` 命名
- `afterEach` で `vi.clearAllMocks()` など既存パターンに合わせる

**実行**:

```sh
npm test                                    # 全ワークスペース
npm test --workspace @iwstkhr/<pkg-name>    # 単一パッケージ
```

## 2. GitHub Actions 更新

**対象**:

| ファイル | 更新が必要なケース |
|---------|------------------|
| `.github/workflows/check.yml` | チェック手順・Node バージョン・新しい検証ステップの追加 |
| `.github/workflows/publish.yml` | 公開対象・タグ形式・ビルド前提の変更 |
| `.github/dependabot.yml` | 依存関係の管理方針変更 |

**現行の Check ワークフロー**（変更時はこれと整合させる）:

1. `npm ci`
1. `npm run check`（Biome）
1. `npm run typecheck`
1. `npm test`
1. `npm run build`

**判断基準**:

- `package.json` の scripts 変更 → check ワークフローの step を見直す
- 新パッケージ追加 → publish ループ（`packages/*/package.json`）で自動対象になるが、README の公開説明を確認
- `mise.toml` の Node バージョン変更 → mise-action の前提が変わらないか確認

## 3. ドキュメント更新

**対象**:

| ファイル | 更新内容 |
|---------|---------|
| `packages/<pkg>/README.md` | API・利用例・挙動・制約の変更 |
| `README.md`（ルート） | パッケージ一覧・開発手順・CI 説明の変更 |
| `packages/<pkg>/package.json` の `description` | パッケージの概要が変わった場合 |

**更新が必要な典型例**:

- 公開 API（export）の追加・変更・削除
- 引数・戻り値・エラー条件の変更
- インストール方法・registry 設定の変更
- 制約事項（例: `JSON.stringify` による引数比較）の追加

ドキュメントのみの変更は `docs:`、テストのみは `test:`、CI のみは `ci:` の
コミットタイプを使う（[README.md](../../../README.md) の Contributing 参照）。

## 4. 検証

変更完了後、ルートで実行:

```sh
npm run check
npm run typecheck
npm test
npm run build
```

pre-commit で Biome などが走る（`.pre-commit-config.yaml`）。PR 前に上記 4 コマンドがすべて成功していること。

## スコープ外（更新不要な変更）

以下はこのスキルのトリガー対象外:

- `*.spec.ts` / `*.test.ts` のみの変更
- `.github/workflows/` のみの変更
- `*.md` のみの変更

## 新パッケージ追加時

1. `packages/<pkg>/src/` に実装と `*.spec.ts` を追加
1. `packages/<pkg>/README.md` を作成
1. ルート `README.md` の Packages セクションに追記
1. `npm test` / `npm run build` がワークスペース経由で通ることを確認
   （check.yml の変更不要なことが多い）
