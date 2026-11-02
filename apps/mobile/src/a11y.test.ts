// Accessibility audit (brief §5): every touch target ≥ 48 dp and every control has a TalkBack label.
// Static: parses the TSX with the TypeScript compiler, so it runs in node without react-native.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

const SRC = resolve(__dirname);
const THEME = resolve(__dirname, '../../../design/system/tokens/theme.ts');
const MIN_DP = 48;

const walk = (d: string): string[] =>
  readdirSync(d).flatMap((n) => {
    const p = join(d, n);
    return statSync(p).isDirectory() ? (n === '__tests__' ? [] : walk(p)) : /\.tsx$/.test(n) && !/\.test\./.test(n) ? [p] : [];
  });

interface Control { where: string; attrs: Map<string, string>; childText: boolean; style: string }

function controls(): Control[] {
  const out: Control[] = [];
  for (const file of walk(SRC)) {
    const sf = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const visit = (n: ts.Node) => {
      const open = ts.isJsxElement(n) ? n.openingElement : ts.isJsxSelfClosingElement(n) ? n : null;
      if (open && /^(Pressable|Touchable\w*)$/.test(open.tagName.getText())) {
        const attrs = new Map<string, string>();
        for (const a of open.attributes.properties) if (ts.isJsxAttribute(a)) attrs.set(a.name.getText(), a.initializer?.getText() ?? 'true');
        const childText = ts.isJsxElement(n) && /<Text\b[^>]*>[^<{]*\w/.test(n.children.map((c) => c.getText()).join(''));
        out.push({ where: `${relative(SRC, file)}:${sf.getLineAndCharacterOfPosition(open.getStart()).line + 1}`, attrs, childText, style: attrs.get('style') ?? '' });
      }
      ts.forEachChild(n, visit);
    };
    visit(sf);
  }
  return out;
}

const hiddenFromA11y = (c: Control) => c.attrs.get('importantForAccessibility') === '"no"' || c.attrs.has('accessibilityElementsHidden');

describe('accessibility: touch targets and labels', () => {
  const all = controls();

  it('finds the app controls', () => {
    // Most controls now come from the shared kit (IconButton, PillButton, ListRow, Chip), so raw Pressables are fewer.
    expect(all.length).toBeGreaterThan(15);
  });

  it('every touch-size token in the design system is ≥ 48 dp', () => {
    const theme = readFileSync(THEME, 'utf8');
    const sizes = [...theme.matchAll(/"(minHeight|minTarget|target|iconButton|iconButtonTarget|min)": (\d+)/g)];
    expect(sizes.length).toBeGreaterThan(20);
    for (const [m, , v] of sizes) expect(Number(v), m).toBeGreaterThanOrEqual(MIN_DP);
  });

  it('every visible control has an accessibilityRole and a label (prop or visible text)', () => {
    const bad = all
      .filter((c) => !hiddenFromA11y(c))
      .filter((c) => !c.attrs.has('accessibilityRole') || !(c.attrs.has('accessibilityLabel') || c.childText))
      .map((c) => c.where);
    expect(bad).toEqual([]);
  });

  it('every control is sized from a ≥48 dp token, fills its row, or is a padded card; no literal size under 48', () => {
    const sized = /touch\.min|minTarget|\.target\b|iconButton|minHeight|shutter\.size|flex: 1|padding: c\.padding/;
    const bad: string[] = [];
    for (const c of all.filter((x) => !hiddenFromA11y(x))) {
      if (!sized.test(c.style)) bad.push(`${c.where} (no target size)`);
      for (const [, k, v] of c.style.matchAll(/\b(minHeight|height|width): (\d+)\b/g)) if (Number(v) < MIN_DP) bad.push(`${c.where} ${k}: ${v}`);
    }
    expect(bad).toEqual([]);
  });

  it('hit slop only extends a target, never replaces a missing size', () => {
    for (const c of all.filter((x) => x.attrs.has('hitSlop'))) expect(c.style, c.where).toMatch(/minHeight|minTarget/);
  });
});
