// Web touch targets (brief §5): interactive selectors in app.css get min-height ≥ 48px.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync(resolve(__dirname, 'app.css'), 'utf8');
/** Flat rule list: [selector, body]; nested @media blocks contribute their inner rules. */
const rules = [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => [(m[1] ?? "").trim(), m[2] ?? ""] as const);
const px = (body: string, prop: string) => Number(body.match(new RegExp(`(?:^|;|\\s)${prop}:\\s*(\\d+)px`))?.[1] ?? NaN);

describe('web accessibility: 48px targets', () => {
  it.each(['.btn', '.btn-sm', '.sk-nav a', '.lookup-examples button', '.chip-edit', '.chip-edit button'])('%s has min-height ≥ 48px', (sel) => {
    const body = rules.filter(([s]) => s.split(',').map((x) => x.trim()).includes(sel)).map(([, b]) => b).join(';');
    expect(px(body, 'min-height')).toBeGreaterThanOrEqual(48);
  });

  it('no button/link rule sets a min-height or height under 48px', () => {
    const bad = rules
      .filter(([s]) => /\bbutton\b|\.btn\b|(^|[\s,])a(\b|:|\[)/.test(s))
      .flatMap(([s, b]) => (['min-height', 'height'] as const).map((p) => [s, p, px(b, p)] as const))
      .filter(([, , v]) => v < 48)
      .map(([s, p, v]) => `${s} ${p}: ${v}px`);
    expect(bad).toEqual([]);
  });
});
