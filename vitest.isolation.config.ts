import { defineConfig } from 'vitest/config';

// 実 DB を使う分離テスト。Docker（Testcontainers）が要る。
// 使い方: npx vitest run -c vitest.isolation.config.ts <ファイル>
export default defineConfig({
  test: {
    include: ['tests/isolation/**/*.test.ts'],
    passWithNoTests: true,
    testTimeout: 120_000,
    hookTimeout: 120_000,
    fileParallelism: false,
  },
});
