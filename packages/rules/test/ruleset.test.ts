import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { BandCutoffs, FacetMapping, ReadingProfile, Rule } from '@skinkey/contracts';
import { BAND_CUTOFFS, FACET_MAP, READING_PROFILES, RULES, SOURCES, rulesetHash, sha256Hex, stableStringify } from '../src';

describe('rule table', () => {
  it('every rule parses against the contract schema', () => {
    for (const r of RULES) expect(Rule.parse(r)).toEqual(r);
    expect(BandCutoffs.parse(BAND_CUTOFFS)).toEqual(BAND_CUTOFFS);
    for (const p of READING_PROFILES) expect(ReadingProfile.parse(p)).toEqual(p);
    for (const f of FACET_MAP) expect(FacetMapping.parse(f)).toEqual(f);
  });

  it('has the spec rule ids with unique ids', () => {
    const ids = RULES.map((r) => r.ruleId);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual(['OCC-1', 'OCC-2', 'FRG-1', 'ALC-1', 'SUP-1', 'SUP-2', 'LC-1a', 'LC-1b', 'LC-2', 'LC-3', 'MED-1']);
  });

  it('grades: R/L/T on every non-medicine rule; medicine has none', () => {
    for (const r of RULES) {
      if (r.kind === 'MEDICINE') expect(r.grade).toBeNull();
      else expect(['R', 'L', 'T']).toContain(r.grade);
    }
  });

  it('every rule cites at least one source with a URL; L rules carry a counter-source where the spec asks', () => {
    for (const r of RULES) expect(r.sources.some((s) => s.url?.startsWith('https://'))).toBe(true);
    for (const id of ['OCC-1', 'OCC-2']) expect(RULES.find((r) => r.ruleId === id)!.counterSources.length).toBeGreaterThan(0);
  });

  it('all cited URLs are on the verified list', () => {
    const verified = new Set<string>(Object.values(SOURCES).flatMap((s) => ('url' in s ? [s.url] : [])));
    for (const r of RULES) for (const s of [...r.sources, ...r.counterSources]) if (s.url) expect(verified.has(s.url)).toBe(true);
  });

  it('LC-1b is informational and LC-3 is contested', () => {
    const get = (id: string) => RULES.find((r) => r.ruleId === id)!;
    expect(get('LC-1b').counted).toBe(false);
    expect(get('LC-1a').counted).toBe(true);
    expect(get('LC-3').contested).toBe(true);
  });

  it('templates only use the known placeholders and name their own rule id', () => {
    for (const r of RULES) {
      expect(r.template.replace(/\{(ingredient|claim)\}/g, '')).not.toMatch(/[{}]/);
      if (r.kind !== 'MEDICINE') expect(r.template).toContain(r.ruleId);
    }
  });

  it('every pattern compiles', () => {
    for (const r of RULES) for (const p of [...r.inciSet.patterns, ...r.inciSet.excludes]) expect(() => new RegExp(p, 'i')).not.toThrow();
  });

  it('class → facet mapping matches spec §5', () => {
    expect(FACET_MAP.filter((f) => f.flipkartFacet).map((f) => [f.youcamClass, f.flipkartFacet])).toEqual([
      ['Oily', 'Oily Skin'],
      ['Dry', 'Dry Skin'],
      ['Combination', 'Combination Skin'],
      ['Normal', 'All Skin Types'],
    ]);
  });

  it('six reading profiles with distinct band vectors', () => {
    expect(READING_PROFILES).toHaveLength(6);
    expect(new Set(READING_PROFILES.map((p) => JSON.stringify(p.bands))).size).toBe(6);
  });
});

describe('ruleset hash', () => {
  it('sha256 matches known vectors', () => {
    expect(sha256Hex('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    expect(sha256Hex('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    for (const text of ['ü€😀', 'x'.repeat(55), 'y'.repeat(64), 'z'.repeat(1000)]) {
      expect(sha256Hex(text)).toBe(createHash('sha256').update(text, 'utf8').digest('hex'));
    }
  });

  it('stableStringify ignores key order', () => {
    expect(stableStringify({ b: 1, a: [2, { d: 3, c: 4 }] })).toBe(stableStringify({ a: [2, { c: 4, d: 3 }], b: 1 }));
  });

  it('is stable across calls', () => {
    expect(rulesetHash()).toBe(rulesetHash(RULES));
  });
});
