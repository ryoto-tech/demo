# 開発の進め方（Claude Code）

対象: このリポジトリで、Claude Code を使って機能を作る人。Claude Code だけで回せるように書いている（Codex は任意。§7）。

前提: CLAUDE.md（一次資料）・HANDOFF.md（引き継ぎ）・UI_GUIDELINES.md（画面の規約）・AGENTS.md（外部のエージェント向け）を先に読む。この手順書はそれらを上書きしない。食い違ったら CLAUDE.md が正。

## 1. 役割

CLAUDE.md §3 を見る。サブエージェントは `.claude/agents/` にある。

| 呼び方 | 中身 |
|---|---|
| `programmer` | 大きめの実装。作業用コピー（`isolation: worktree`）で起動する |
| `code-reviewer` | 境界・DB に触る変更のレビュー。読むだけ |
| 2 人目のレビュー役 | `code-reviewer` を観点を変えてもう 1 つ起動する |
| `e2e-tester` | E2E。`MODE: UI_REVIEW` を付けると画面の点検 |

## 2. 1 つの機能の流れ

1. **依頼する。** 「こうしたい」を Claude Code に伝える。画面のことは写真を貼ると早い。
2. **仕様書を先に直す。** docs/02 → docs/04 → docs/05 の順に書かせる（CLAUDE.md §8.7）。DB に触るか・越境の境界に触るかを Claude に判定させる。
3. **作らせる。** 大きいものは `programmer` に頼む。作業用コピーを機能ごとに分けるので、並行してもぶつからない。
4. **手元で全部確かめる（送る前に）。**
   - 型チェック: `npx tsc --noEmit -p apps/web` と `npx tsc -p tsconfig.tests.json`
   - lint、変えた範囲のテスト、tests/static
   - 境界・DB に触るなら、分離テスト: `npx vitest run -c vitest.isolation.config.ts <ファイル>`
   - 画面は撮影して前後を見比べる（§5）
   - 開いている他の人の PR と試しに合わせる: `git merge-tree --write-tree --name-only HEAD origin/<相手のブランチ>`
   - まとめて回すなら `npm run check`
5. **レビュー**（§4 の基準で）。
6. **1 本の PR にまとめて、送るのは 1 回だけ。** CI が通ったら、人間の OK でマージ。
7. **人間の OK でデモに反映し、ログインして確かめる**（§6）。

## 3. 決まりごと

CLAUDE.md §7 を見る。理由も含めて書いてある。

## 4. レビューの基準

CLAUDE.md §9 を見る。2 人目のレビュー役の頼み方の例:

```
code-reviewer として、この差分をレビューしてください。
観点: 境界は見なくてよい。同時に 2 回送る・遅れて届く・途中で落ちる、
のような競合と取りこぼしだけを見てください。
出力: 結論 / 必ず直す / 直したほうがよい / 確かめていないこと
```

## 5. 画面の確かめ方

- 撮影: UI_GUIDELINES.md §6。
- 🔴 ブラウザでしか起きない不具合がある。たとえば `fetch` をオブジェクトに入れて `deps.fetch()` で呼ぶと、ブラウザだけで `Illegal invocation` になる。送信・アップロードのような操作は、デモでブラウザから実際に試す。
- AI くささ: AGENTS.md §5.1 の 11 項目。撮った写真を `e2e-tester`（MODE: UI_REVIEW）に読ませて点数を付けさせる。

## 6. デモへの反映（Railway）

- 自動では反映されない。元のフォルダ（Railway と紐づいている）を最新の main にして実行する:

```bash
git checkout main && git pull --ff-only && npx -y @railway/cli up --service web
```

- 🔴 作業用コピー（.claude/worktrees/）は .gitignore で外れているので送られない。元のフォルダでブランチを切り替えない。
- Claude に反映させる場合は、毎回「反映して」と OK を出す（権限の設定で、OK が無いと止まる）。
- 切り替わったかは、サインイン画面の読み込むファイル名が変わるかで分かる。切り替わったら、合成アカウント（docs/DEV-ACCOUNTS.md）でログインして確かめる。

## 7. （任意）Codex を Claude から呼ぶ

無くても回る。ChatGPT のアカウントがあって、もう 1 つ別の目が欲しいときだけ。2 人目のレビュー役の代わりに使える。規約は AGENTS.md。

```bash
# 一度だけ: 自分の設定のモデル名が使えないときは、認証だけを持つ別の置き場を作る
mkdir -p <一時フォルダ>/codex-home && ln -s ~/.codex/auth.json <一時フォルダ>/codex-home/auth.json

# 読むだけのレビュー（差分を作業用コピーに置いて渡す）
CODEX_HOME=<一時フォルダ>/codex-home npx -y @openai/codex exec \
  --sandbox read-only -C <作業用コピー> -o <結果.md> "<依頼文>" < /dev/null

# 書き換えてよい作業（画面の小さな修正など。commit / push はさせない）
# ... --sandbox workspace-write ...
```

## 8. この機械（16GB の Mac）の注意

HANDOFF.md の「罠」を見る。

## 9. 困ったとき

- **CI が落ちた:** `gh run view <id> --log-failed` で失敗したテストを見る。
- **他の人の PR とぶつかる:** 自分の側で直す。相手のブランチには手を入れず、原因が分かれば PR にコメントで伝える。
- **権限で止められた（デプロイ・マージ・CLAUDE.md の書き換え）:** 回り道をしない。人間に OK をもらう。
