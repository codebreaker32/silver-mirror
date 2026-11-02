import { isFlipkartShortLink, parseFlipkartLocation } from '@skinkey/contracts';

/** Minimal XMLHttpRequest surface we use; injectable for tests. */
export interface XhrLike {
  readyState: number;
  responseURL: string;
  timeout: number;
  onreadystatechange: (() => void) | null;
  onerror: (() => void) | null;
  ontimeout: (() => void) | null;
  open(method: string, url: string): void;
  send(): void;
  abort(): void;
}

const HEADERS_RECEIVED = 2;

/**
 * Follows a dl.flipkart.com/s/<code> share link from the phone and returns the final listing URL
 * (flipkart.com/<slug>/p/<itm>?pid=…), or null. Flipkart stalls this lookup from Cloudflare IPs
 * (BUGS.md item 7), so the phone does it and the Worker parses the URL with no network call.
 * Only the link address is read: the request is aborted as soon as headers arrive, before the page body.
 */
export function followFlipkartShortLink(
  url: string | null | undefined,
  makeXhr: () => XhrLike = () => new XMLHttpRequest() as unknown as XhrLike,
  timeoutMs = 5000,
): Promise<string | null> {
  if (!isFlipkartShortLink(url ?? null)) return Promise.resolve(null);
  return new Promise((resolve) => {
    let done = false;
    let xhr: XhrLike;
    const finish = (value: string | null) => {
      if (done) return;
      done = true;
      try {
        xhr.abort();
      } catch {
        // already closed
      }
      resolve(value && parseFlipkartLocation(value) ? value : null);
    };
    try {
      xhr = makeXhr();
      xhr.timeout = timeoutMs;
      xhr.onreadystatechange = () => {
        if (xhr.readyState < HEADERS_RECEIVED || done) return;
        // React Native fires HEADERS_RECEIVED before it assigns responseURL (Libraries/Network/XMLHttpRequest.js),
        // so read it once this event has returned.
        if (xhr.responseURL) finish(xhr.responseURL);
        else setTimeout(() => finish(xhr.responseURL || null), 0);
      };
      xhr.onerror = () => finish(null);
      xhr.ontimeout = () => finish(null);
      xhr.open('GET', url!);
      xhr.send();
    } catch {
      resolve(null);
    }
  });
}
