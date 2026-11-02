import { describe, expect, it } from 'vitest';
import { READING_PROFILES, profileKey } from '@skinkey/rules';
import { focusTilesFor } from './focus';

const key = (id: string) => profileKey(READING_PROFILES.find((p) => p.id === id)!);

describe('focus tiles', () => {
  it('come from the published rules the reading triggers', () => {
    expect(focusTilesFor(key('oily-redness')).map((f) => f.label)).toEqual(['Lighter textures', 'Fragrance-free']);
    expect(focusTilesFor(key('dry')).map((f) => f.label)).toEqual(['Hydration']);
    expect(focusTilesFor(key('normal'))).toEqual([]);
  });
  it('never use fix words', () => {
    const labels = READING_PROFILES.flatMap((p) => focusTilesFor(profileKey(p)).map((f) => f.label.toLowerCase()));
    for (const banned of ['repair', 'treat', 'fix', 'cure', 'heal']) expect(labels.some((l) => l.includes(banned))).toBe(false);
  });
});
