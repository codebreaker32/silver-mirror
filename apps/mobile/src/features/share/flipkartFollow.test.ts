import { describe, expect, it } from 'vitest';
import { followFlipkartShortLink, type XhrLike } from './flipkartFollow';

const SHORT = 'https://dl.flipkart.com/s/qPYPSuNNNN';
const LISTING = 'https://www.flipkart.com/vaseline-gluta-hya-dewy-radiance-serum/p/itm123?pid=BLMABC';

function fakeXhr(script: (x: XhrLike) => void) {
  const opened: string[] = [];
  let aborted = 0;
  const x: XhrLike = {
    readyState: 0,
    responseURL: '',
    timeout: 0,
    onreadystatechange: null,
    onerror: null,
    ontimeout: null,
    open: (_m, url) => void opened.push(url),
    send: () => script(x),
    abort: () => void (aborted += 1),
  };
  return { make: () => x, opened, aborted: () => aborted };
}

describe('followFlipkartShortLink', () => {
  it('returns the listing URL once headers arrive and aborts before the body', async () => {
    const f = fakeXhr((x) => {
      x.readyState = 2;
      x.responseURL = LISTING;
      x.onreadystatechange?.();
    });
    await expect(followFlipkartShortLink(SHORT, f.make)).resolves.toBe(LISTING);
    expect(f.opened).toEqual([SHORT]);
    expect(f.aborted()).toBe(1);
  });

  it('returns null when the redirect lands somewhere that is not a listing', async () => {
    const f = fakeXhr((x) => {
      x.readyState = 2;
      x.responseURL = 'https://www.flipkart.com/account/login';
      x.onreadystatechange?.();
    });
    await expect(followFlipkartShortLink(SHORT, f.make)).resolves.toBeNull();
  });

  it('returns null on network error or timeout', async () => {
    await expect(followFlipkartShortLink(SHORT, fakeXhr((x) => x.onerror?.()).make)).resolves.toBeNull();
    await expect(followFlipkartShortLink(SHORT, fakeXhr((x) => x.ontimeout?.()).make)).resolves.toBeNull();
  });

  it('never opens anything that is not a dl.flipkart.com/s/ short link', async () => {
    const f = fakeXhr(() => undefined);
    await expect(followFlipkartShortLink('https://evil.example/s/abcdef', f.make)).resolves.toBeNull();
    await expect(followFlipkartShortLink(null, f.make)).resolves.toBeNull();
    expect(f.opened).toEqual([]);
  });
});
