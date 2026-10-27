## 何を変えたか

（1〜3 行）

## 仕様書（CLAUDE.md §8.7）

- 変えた AC: AC-___
- DB に触る: はい / いいえ
- 越境の境界に触る（認証・権限・外部送信・AI・管理画面）: はい / いいえ

## 送る前の確認（全部済ませてから 1 回だけ push）

- [ ] `npx tsc --noEmit -p apps/web`
- [ ] `npx tsc -p tsconfig.tests.json`
- [ ] lint・変えた範囲のテスト・tests/static
- [ ] 境界・DB に触るなら分離テスト
- [ ] 画面なら 1440px と 390px の撮影（前後）
- [ ] 開いている他の PR と `git merge-tree` で試しに合わせた
- [ ] 番号（改訂・AC・migration）は main を見て決めた

## レビュー（CLAUDE.md §9）

- [ ] code-reviewer: 済 / 不要
- [ ] 2 人目のレビュー役（観点: ＿＿＿）: 済 / 不要
- [ ] CLAUDE.md を変えたなら、人間 2 人の承認

## 確かめていないこと

-
