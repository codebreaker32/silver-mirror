import { describe, expect, it } from 'vitest';
import { COPY, DEMO_KEY, Verdict, type Band, type Concern, type KeyProfile } from '@skinkey/contracts';
import {
  CONCERNS,
  CONCERN_WORSENS,
  NAME_ONLY_NOTE,
  NO_READINGS_SUBTITLE,
  READING_PROFILES,
  RULES,
  applySelfReport,
  formatScanDate,
  labelCheck,
  parseInciList,
  profileKey,
  rulesetHash,
  verdict,
} from '../src';
import { PRODUCTS, byId } from './fixtures/products';

const realKey: KeyProfile = {
  ...DEMO_KEY,
  source: 'youcam_hd',
  scanId: 'scan_1',
  scanDate: '2026-11-01T06:00:00.000Z',
  expiresAt: '2026-12-01T06:00:00.000Z',
  bands: {
    oiliness: { level: 'High', region: 'whole', selfReported: false },
    moisture: { level: 'Low', region: 'whole', selfReported: false },
    redness: { level: 'High', region: 'whole', selfReported: false },
    pore: { level: 'Medium', region: 'whole', selfReported: false },
  },
  pores: { nose: 'High' },
};

const run = (id: string, key: KeyProfile | null = realKey) => {
  const p = byId(id);
  return verdict({ key, inci: p.inci, inciSource: 'catalog_verified', inciSourceUrl: p.source_url, claims: p.claims, title: p.name });
};

describe('verdict order (spec §5)', () => {
  it('1. MEDICINE wins over everything, with no reasons', () => {
    const v = run('fx-bpo-wash');
    expect(v.label).toBe('MEDICINE');
    expect(v.subtitle).toBe(COPY.medicine('benzoyl peroxide'));
    expect(v.medicineToken).toBe('benzoyl peroxide');
    expect(v.reasons).toEqual([]);
    expect(v.labelChecks).toEqual([]);
  });

  it('MEDICINE also fires from the title when there is no INCI', () => {
    const v = verdict({ key: realKey, inci: null, inciSource: null, claims: [], title: 'Ketoconazole 2% Shampoo' });
    expect(v.label).toBe('MEDICINE');
  });

  it('2. no verified INCI → UNKNOWN with the fixed copy', () => {
    const v = verdict({ key: realKey, inci: null, inciSource: null, claims: [] });
    expect(v.label).toBe('UNKNOWN');
    expect(v.subtitle).toBe(COPY.subtitle.UNKNOWN);
    expect(v.basis).toBe('none');
  });

  it('name only stays UNKNOWN (no verdict from a title), flagged as name_only', () => {
    const v = verdict({ key: realKey, inci: null, inciSource: null, claims: [], title: 'Some Oily Skin Gel' });
    expect(v.label).toBe('UNKNOWN');
    expect(v.basis).toBe('name_only');
    expect(v.note).toBe(NAME_ONLY_NOTE);
  });

  it('tokens without a source (unconfirmed chips) are not enough', () => {
    const v = verdict({ key: realKey, inci: parseInciList('Aqua, Petrolatum'), inciSource: null, claims: [] });
    expect(v.label).toBe('UNKNOWN');
  });

  it('3. any FIT_CAUTION rule → CAUTION, reasons ordered R > L > T', () => {
    const v = run('fx-heavy-cream');
    expect(v.label).toBe('CAUTION');
    expect(v.subtitle).toBe(COPY.subtitle.CAUTION);
    expect(v.reasons.map((r) => r.ruleId)).toEqual(['FRG-1', 'OCC-2', 'OCC-1']);
    expect(v.reasons.map((r) => r.grade)).toEqual(['R', 'L', 'T']);
  });

  it('4. otherwise FITS with support reasons', () => {
    const v = run('fx-gel-niacinamide');
    expect(v.label).toBe('FITS');
    expect(v.subtitle).toBe(COPY.subtitle.FITS);
    expect(v.reasons.map((r) => r.ruleId)).toEqual(['SUP-1', 'SUP-2']);
  });

  it('FITS with nothing to say uses the fixed no-flags line', () => {
    const key = profileKey(READING_PROFILES.find((p) => p.id === 'normal')!);
    const v = run('fx-gel-niacinamide', key);
    expect(v.label).toBe('FITS');
    expect(v.reasons).toEqual([]);
    expect(v.note).toBe(COPY.fitsNoFlags);
  });

  it('no Key: label checks still run, fit stays UNKNOWN', () => {
    const v = run('fx-fragrance-free-lie', null);
    expect(v.label).toBe('UNKNOWN');
    expect(v.subtitle).toBe(NO_READINGS_SUBTITLE);
    expect(v.labelChecks.map((r) => r.ruleId)).toEqual(['LC-1a', 'LC-1b']);
  });
});

describe('label check never changes the label on its own', () => {
  it('a strict LC hit under a Normal profile is still FITS', () => {
    const key = profileKey(READING_PROFILES.find((p) => p.id === 'normal')!);
    const v = run('fx-alcohol-toner', key);
    expect(v.label).toBe('FITS');
    expect(v.labelChecks[0]).toMatchObject({ ruleId: 'LC-2', ingredient: 'Alcohol Denat.', counted: true });
  });

  it('uses the spec phrasing', () => {
    const hits = labelCheck([{ type: 'fragrance_free' }], parseInciList('Aqua, Glycerin, Parfum'));
    expect(hits).toHaveLength(1);
    expect(hits[0]!.plain).toBe("Listing says 'fragrance-free'. Its ingredient list has Parfum (rule LC-1a).");
  });

  it('LC-1b is informational (not counted); LC-3 is contested', () => {
    const v = run('fx-fragrance-free-lie');
    expect(v.labelChecks.find((r) => r.ruleId === 'LC-1b')?.counted).toBe(false);
    const oil = labelCheck(byId('fx-oil-free-jojoba').claims, byId('fx-oil-free-jojoba').inci);
    expect(oil).toEqual([expect.objectContaining({ ruleId: 'LC-3', contested: true, matchedToken: 'Simmondsia Chinensis (Jojoba) Seed Oil' })]);
  });

  it('a clean free-from listing has no hits (benzyl and cetyl alcohol do not count)', () => {
    const p = byId('fx-clean-sunscreen');
    expect(labelCheck(p.claims, p.inci)).toEqual([]);
  });

  it('claims without an LC rule are ignored', () => {
    expect(labelCheck([{ type: 'for_oily_skin' }], parseInciList('Parfum, Alcohol'))).toEqual([]);
  });
});

describe('reason phrasing (brief P1, spec §2B)', () => {
  it('copy set B: whole-face band with the nose pore reading', () => {
    const v = run('fx-heavy-cream');
    const occ2 = v.reasons.find((r) => r.ruleId === 'OCC-2')!;
    expect(occ2.plain).toBe(
      'Oiliness reading: High (whole face, scan 1 Nov) · Nose pore reading: High. Contains isopropyl myristate, which our rule OCC-2 flags as heavy for oily-looking skin.',
    );
    expect(occ2.glyphZone).toBe('nose');
  });

  it('copy set A: T-zone reading when YouCam returned zone labels', () => {
    const key: KeyProfile = {
      ...realKey,
      copySet: 'A',
      zones: { whole: 'Oily', t_zone: 'Oily', u_zone: 'Normal' },
      bands: { ...realKey.bands, redness: { level: 'Low', region: 'whole', selfReported: false } },
    };
    const v = run('fx-heavy-cream', key);
    expect(v.reasons[0]!.plain).toBe('T-zone reading: Oily (scan 1 Nov). Contains isopropyl myristate, which our rule OCC-2 flags as heavy for oily-looking skin.');
    expect(v.reasons[0]!.glyphZone).toBe('t_zone');
  });

  it('copy set B never renders "T-zone reading"', () => {
    for (const profile of READING_PROFILES) {
      for (const p of PRODUCTS) {
        const v = verdict({ key: profileKey(profile, 'B'), inci: p.inci, inciSource: 'catalog_verified', claims: p.claims });
        for (const r of [...v.reasons, ...v.labelChecks]) expect(r.plain).not.toMatch(/T-zone reading/);
      }
    }
  });

  it('self-reported bands say so instead of a scan date', () => {
    const key = applySelfReport(realKey, 'moisture', 'Low');
    const edited = applySelfReport(key, 'redness', 'High');
    const v = run('fx-alcohol-toner', applySelfReport(edited, 'moisture', 'Medium'));
    expect(v.label).toBe('FITS');
    const v2 = run('fx-alcohol-toner', applySelfReport({ ...realKey, bands: { ...realKey.bands, moisture: { level: 'High', region: 'whole', selfReported: false } } }, 'moisture', 'Low'));
    expect(v2.reasons[0]!.plain).toMatch(/^Moisture reading: Low \(whole face, self-reported\)\./);
  });

  it('Demo Key reasons are labelled as sample readings', () => {
    const v = run('fx-heavy-cream', DEMO_KEY);
    expect(v.reasons[0]!.plain).toContain('sample reading');
    expect(v.provenance.line).toBe(`Sample readings (Demo Key) · rules v${rulesetHash()}`);
  });

  it('formats scan dates in IST', () => {
    expect(formatScanDate('2026-11-01T06:00:00.000Z')).toBe('1 Nov');
    expect(formatScanDate('2026-11-01T19:00:00.000Z')).toBe('2 Nov');
  });
});

describe('provenance', () => {
  it('matches the spec line for a real scan', () => {
    expect(run('fx-heavy-cream').provenance.line).toBe(`Measured by YouCam Skin Analysis HD, 1 Nov · photo deleted · rules v${rulesetHash()}`);
  });

  it('label-photo chips are named in the line', () => {
    const v = verdict({ key: realKey, inci: parseInciList('Aqua, Glycerin'), inciSource: 'label_photo_confirmed', claims: [] });
    expect(v.provenance.line).toContain('Photo of label, confirmed by you');
    expect(v.provenance.inciSource).toBe('label_photo_confirmed');
  });
});

describe('traceability and schema', () => {
  it('every rendered reason carries rule_id + reading + token + source_url and parses as a Verdict', () => {
    for (const profile of READING_PROFILES) {
      for (const p of PRODUCTS) {
        const v = verdict({ key: profileKey(profile), inci: p.inci, inciSource: 'catalog_verified', inciSourceUrl: p.source_url, claims: p.claims, title: p.name });
        expect(() => Verdict.parse(v)).not.toThrow();
        for (const r of [...v.reasons, ...v.labelChecks]) {
          expect(r.ruleId).toMatch(/^[A-Z]+-\w+$/);
          expect(r.reading).not.toBeNull();
          expect(r.ingredient).toBeTruthy();
          expect(r.sourceUrl).toMatch(/^https:\/\//);
          expect(r.inciSourceUrl).toBe(p.source_url);
          expect(r.plain).toContain(r.ruleId);
        }
      }
    }
  });

  it('is deterministic', () => {
    const a = PRODUCTS.map((p) => run(p.id));
    const b = PRODUCTS.map((p) => run(p.id));
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it('does not mutate its inputs', () => {
    const p = byId('fx-heavy-cream');
    const before = JSON.stringify({ realKey, p });
    run('fx-heavy-cream');
    expect(JSON.stringify({ realKey, p })).toBe(before);
  });
});

describe('monotonicity: more concern never turns CAUTION into FITS', () => {
  const levels: Band[] = ['Low', 'Medium', 'High'];
  const allVectors: Record<Concern, Band>[] = [];
  for (const o of levels) for (const m of levels) for (const r of levels) for (const p of levels) allVectors.push({ oiliness: o, moisture: m, redness: r, pore: p });
  const keyOf = (b: Record<Concern, Band>): KeyProfile => ({
    ...realKey,
    pores: {},
    bands: {
      oiliness: { level: b.oiliness, region: 'whole', selfReported: false },
      moisture: { level: b.moisture, region: 'whole', selfReported: false },
      redness: { level: b.redness, region: 'whole', selfReported: false },
      pore: { level: b.pore, region: 'whole', selfReported: false },
    },
  });

  it('holds for every band vector × concern step × fixture SKU', () => {
    let checked = 0;
    for (const p of PRODUCTS.filter((x) => x.status === 'verified')) {
      for (const vec of allVectors) {
        const before = verdict({ key: keyOf(vec), inci: p.inci, inciSource: 'catalog_verified', claims: p.claims });
        if (before.label !== 'CAUTION') continue;
        for (const c of CONCERNS) {
          const order = CONCERN_WORSENS[c];
          const idx = order.indexOf(vec[c]);
          if (idx === order.length - 1) continue;
          const after = verdict({ key: keyOf({ ...vec, [c]: order[idx + 1]! }), inci: p.inci, inciSource: 'catalog_verified', claims: p.claims });
          expect(after.label).toBe('CAUTION');
          checked++;
        }
      }
    }
    expect(checked).toBeGreaterThan(50);
  });
});

describe('snapshot matrix: SKUs × 6 reading profiles', () => {
  it('matches the frozen matrix', () => {
    const matrix = Object.fromEntries(
      PRODUCTS.map((p) => [
        p.id,
        Object.fromEntries(
          READING_PROFILES.map((profile) => {
            const v = verdict({ key: profileKey(profile), inci: p.status === 'verified' ? p.inci : null, inciSource: p.status === 'verified' ? 'catalog_verified' : null, claims: p.claims, title: p.name });
            return [profile.id, `${v.label}${v.reasons.length ? ` ${v.reasons.map((r) => r.ruleId).join('+')}` : ''}`];
          }),
        ),
      ]),
    );
    expect(matrix).toMatchSnapshot();
  });

  it('rules changes change the hash', () => {
    const tweaked = RULES.map((r) => (r.ruleId === 'OCC-1' ? { ...r, positionLimit: 6 } : r));
    expect(rulesetHash(tweaked)).not.toBe(rulesetHash());
    expect(rulesetHash()).toMatch(/^[0-9a-f]{12}$/);
  });
});
