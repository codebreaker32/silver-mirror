import { beforeEach, describe, expect, it } from 'vitest';
import { nykaaFixture, SHARE_FIXTURES } from '@skinkey/contracts';
import { clearShares, postShare, shareRoute, takeShare } from './inbox';
import { inputFromShareIntent } from './parse';

const share = (text: string) => inputFromShareIntent({ text })!;

describe('share inbox (warm-start shares)', () => {
  beforeEach(() => clearShares());

  it('gives each share a fresh id and hands it over exactly once', () => {
    const id = postShare(share(SHARE_FIXTURES.amazon));
    const first = takeShare(id);
    expect(first?.kind).toBe('text');
    expect(takeShare(id)).toBeNull();
  });

  it('a second share while a check is open supersedes the first', () => {
    const a = postShare(share(SHARE_FIXTURES.flipkartShortLink));
    const b = postShare(share(SHARE_FIXTURES.amazon));
    expect(a).not.toBe(b);
    expect(takeShare(a)).toBeNull();
    const got = takeShare(b);
    expect(got && got.kind === 'text' ? got.parsed.store : null).toBe('amazon_in');
  });

  it('ignores a missing id (the idle /check screen)', () => {
    expect(takeShare(undefined)).toBeNull();
    expect(takeShare('')).toBeNull();
  });

  it('reuses an open check screen instead of stacking a second one', () => {
    expect(shareRoute('/check', 's3')).toEqual({ kind: 'setParams', share: 's3' });
    expect(shareRoute('/', 's3')).toEqual({ kind: 'push', share: 's3' });
    expect(shareRoute('/key', 's4').kind).toBe('push');
  });

  it('posts every real store payload', () => {
    for (const text of [SHARE_FIXTURES.flipkartShortLink, SHARE_FIXTURES.amazon, nykaaFixture()]) {
      const input = share(text);
      expect(takeShare(postShare(input))).toEqual(input);
    }
  });
});
