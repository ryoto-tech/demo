# HANDOFF.md（引き継ぎ）

作業を始める人・セッションが最初に読むメモです。決まりごとは CLAUDE.md が正です。

## 今の状態（2026-10-27）

- 開発の仕組みだけを入れた。アプリ本体はまだ無い。
  - 資料: CLAUDE.md・HANDOFF.md・UI_GUIDELINES.md・AGENTS.md・docs/
  - サブエージェント: `.claude/agents/` の programmer・code-reviewer・e2e-tester
  - 権限: `.claude/settings.json`（push・マージ・反映・CLAUDE.md の書き換えで止まる）
  - CI: `.github/workflows/ci.yml`（build → 単体 → 分離 → E2E）
- apps/web には型チェックとテストが通るだけの最小のコードがある。

## 次にやること

1. 何を作るかを決めて、docs/02 に要件を書く。
2. アプリの技術（例: Next.js + Tailwind + Postgres）を決めて、apps/web を作り直す。
3. DB を使うなら、分離テストの土台（Testcontainers）を tests/isolation に作る。
4. 画面ができたら、Playwright の設定と tests/e2e を作る。CI の E2E は設定ファイルができると自動で動く。
5. デモの置き場（Railway のサービス）を作り、docs/DEV-ACCOUNTS.md に合成アカウントを書く。
6. GitHub 側の設定（人間がやる）: main の保護、PR 必須、CI 必須、CLAUDE.md の 2 人承認（.github/CODEOWNERS）。

## ぶつかりやすいファイル

同じファイルを触る PR は 1 本ずつ出す（CLAUDE.md §7.4）。分かったら追記する。

| ファイル | 理由 |
|---|---|
| docs/05-acceptance.md | AC 番号と改訂履歴を皆が足す |
| package.json / package-lock.json | 依存の追加が重なる |

## 罠

| 症状 | 原因と対処 |
|---|---|
| 分離テストが import で落ちる | Node v22.11 で起きることがある。22.12 以降か 23 を使う |
| 分離テストが始まらない | Docker が動いていない。Docker Desktop を起動する |
| 型チェックが 10 分を超える | 16GB の Mac では起きる。裏で回し、同時に 2 つ走らせない |
| `timeout` が無い | macOS には無い。長い処理は裏で回して、ログの更新時刻（`stat -f %m`）で見張る |
| 作業用コピーで容量が減る | 1 本 1GB 前後。マージ済みは `git worktree remove` |
| 依存を足すと `Cannot read properties of null (reading 'edgesOut')` | npm 10.9 の不具合（Vitest 4 以降で起きる）。`npx -y npm@11 install ...` で足す。`npm ci` は npm 10 でも動く |
| Vitest が Node 23 に未対応と警告する | 奇数版は公式の対象外。動くが、気になるなら Node 22.12 以降か 24 を使う（CI は .nvmrc の 22） |

## この機械で足りないもの（2026-10-27 時点）

- GitHub CLI（`gh`）: `brew install gh` のあと `gh auth login`
- Docker Desktop: 分離テストに必要
- Railway へのログイン: `npx -y @railway/cli login`
