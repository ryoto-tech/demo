import { defineConfig } from 'vitest/config';

// 単体テストと static。分離テスト（実 DB）は vitest.isolation.config.ts で別に回す。
export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts', 'tests/static/**/*.test.ts'],
  },
});
