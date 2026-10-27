import { describe, expect, it } from 'vitest';
import { appName } from '../../apps/web/src/index';

describe('apps/web', () => {
  it('アプリ名を返す', () => {
    expect(appName()).toBe('demo');
  });
});
