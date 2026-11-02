import type { CheckInput } from './parse';

/**
 * Hand-off between the root share listener and the check screen.
 *
 * Every incoming share (cold or warm start) is posted here under a fresh id and the
 * check screen is routed to `/check?share=<id>`. The screen takes the input for its
 * id exactly once and starts a fresh check, so a share that arrives while a check is
 * already on screen replaces it instead of being swallowed.
 */
let seq = 0;
const pending = new Map<string, CheckInput>();

export function postShare(input: CheckInput): string {
  seq += 1;
  const id = `s${seq}`;
  pending.clear(); // Only the newest share matters; older ones were superseded.
  pending.set(id, input);
  return id;
}

/** Returns the share posted under `id` once; later calls (re-renders, back-and-forth) get null. */
export function takeShare(id: string | null | undefined): CheckInput | null {
  if (!id) return null;
  const input = pending.get(id) ?? null;
  pending.delete(id);
  return input;
}

/** Where a new share goes from the current route: reuse an open check screen (new params), else open one. */
export function shareRoute(pathname: string, id: string): { kind: 'setParams' | 'push'; share: string } {
  return { kind: pathname === '/check' ? 'setParams' : 'push', share: id };
}

/** Test helper. */
export function clearShares(): void {
  pending.clear();
}
