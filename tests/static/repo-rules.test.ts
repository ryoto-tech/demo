// リポジトリの決まり（CLAUDE.md）が崩れていないかを機械で確かめる。
import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (p: string) => readFileSync(p, 'utf8');

describe('資料', () => {
  it.each(['CLAUDE.md', 'HANDOFF.md', 'UI_GUIDELINES.md', 'AGENTS.md', 'docs/DEVELOPMENT.md'])(
    '%s がある',
    (p) => {
      expect(existsSync(p)).toBe(true);
    },
  );

  it('仕様書の 02・04・05 がある', () => {
    for (const p of ['docs/02-requirements.md', 'docs/04-design.md', 'docs/05-acceptance.md']) {
      expect(existsSync(p), p).toBe(true);
    }
  });

  it('CLAUDE.md に §8.7（仕様書の順番）がある', () => {
    expect(read('CLAUDE.md')).toMatch(/8\.7 .*docs\/02 → docs\/04 → docs\/05/);
  });

  it('AGENTS.md §5.1 の点検項目はちょうど 11 個', () => {
    const section = read('AGENTS.md').split('### 5.1')[1]?.split('###')[0] ?? '';
    const items = section.match(/^\d+\. /gm) ?? [];
    expect(items).toHaveLength(11);
  });
});

describe('サブエージェント', () => {
  it.each(['programmer', 'code-reviewer', 'e2e-tester'])('%s の定義があり、name が合っている', (name) => {
    const p = `.claude/agents/${name}.md`;
    expect(existsSync(p)).toBe(true);
    expect(read(p)).toMatch(new RegExp(`^---\\nname: ${name}\\n`));
  });

  it('code-reviewer は書き換えの道具を持たない', () => {
    const tools = read('.claude/agents/code-reviewer.md').match(/^tools: (.*)$/m)?.[1] ?? '';
    expect(tools).not.toMatch(/Edit|Write/);
  });
});

describe('権限の設定', () => {
  const settings = JSON.parse(read('.claude/settings.json')) as {
    permissions: { allow: string[]; ask: string[]; deny: string[] };
  };

  it('push・マージ・反映・CLAUDE.md の書き換えは人間の OK が要る', () => {
    const { ask } = settings.permissions;
    expect(ask).toContain('Bash(git push *)');
    expect(ask).toContain('Bash(gh pr merge *)');
    expect(ask.some((r) => r.includes('railway') && r.includes('up'))).toBe(true);
    expect(ask).toContain('Edit(CLAUDE.md)');
  });

  it('force push と main への直接の push は禁止', () => {
    const { deny } = settings.permissions;
    expect(deny).toContain('Bash(git push --force *)');
    expect(deny).toContain('Bash(git push origin main *)');
  });

  it('allow に push・マージ・反映が紛れ込んでいない', () => {
    const risky = settings.permissions.allow.filter((r) => /git push|pr merge|railway/.test(r));
    expect(risky).toEqual([]);
  });
});

describe('.gitignore', () => {
  it('作業用コピーと個人設定と .env を送らない', () => {
    const gi = read('.gitignore');
    expect(gi).toContain('.claude/worktrees/');
    expect(gi).toContain('.claude/settings.local.json');
    expect(gi).toMatch(/^\.env$/m);
  });
});
