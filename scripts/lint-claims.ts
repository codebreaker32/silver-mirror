// Claim linter (spec §9, brief §4.4). Scans user-facing copy for banned words with the
// rules package's lintCopy(): string literals + JSX text in apps/mobile/src, apps/web/src,
// packages/contracts/src (COPY), plus README.md and any .srt/.vtt subtitles.
// Run: npm run lint:claims  (bundled with esbuild; typescript is external; no network)
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import ts from 'typescript';
import { lintCopy, type LintViolation } from '@skinkey/rules';

const root = process.env.SKINKEY_ROOT ?? process.cwd();
const CODE_DIRS = ['apps/mobile/src', 'apps/web/src', 'packages/contracts/src'];
const DOC_FILES = ['README.md'];
const SKIP_DIR = new Set(['node_modules', 'dist', 'android', 'ios', '__tests__', 'generated', '.expo']);
const isTest = (f: string) => /\.(test|spec)\.tsx?$/.test(f) || /jest\.setup/.test(f);

function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (!SKIP_DIR.has(name)) walk(p, out);
    } else out.push(p);
  }
  return out;
}

/** Strings that are code, not copy: imports, object keys, type positions, comparisons. */
function isCodeString(node: ts.Node): boolean {
  const p = node.parent;
  if (!p) return false;
  if (ts.isImportDeclaration(p) || ts.isExportDeclaration(p) || ts.isExternalModuleReference(p)) return true;
  if (ts.isLiteralTypeNode(p)) return true;
  if ((ts.isPropertyAssignment(p) || ts.isPropertySignature(p)) && p.name === node) return true;
  if (ts.isElementAccessExpression(p) && p.argumentExpression === node) return true;
  if (ts.isCaseClause(p)) return true;
  if (ts.isBinaryExpression(p) && [ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken].includes(p.operatorToken.kind)) return true;
  if (ts.isCallExpression(p) && /^(require|import)$/.test(p.expression.getText())) return true;
  // JSX attributes that are not read aloud / shown
  if (ts.isJsxAttribute(p)) {
    const n = p.name.getText();
    return !/^(accessibilityLabel|accessibilityHint|aria-label|title|alt|placeholder|label|hint|text|subtitle|message)$/.test(n);
  }
  return false;
}

/** Identifier-like strings (testIDs, enum values, keys) are not copy. */
const looksLikeCode = (s: string) => !/\s/.test(s) && /^[a-z0-9_./:#@-]*$/i.test(s) && !/^[A-Z][a-z]/.test(s);

export interface Hit { file: string; line: number; text: string; v: LintViolation }

/**
 * The app was renamed SkinKey → Silver Mirror (user-facing only). The old name and the old glossary ("Your Key",
 * "Demo Key", "Delete Key", "No Key yet") must not come back in copy. Code identifiers are not copy; a line that has to
 * quote the old name is marked lint-claims:allow.
 */
const RENAME = /\bSkinKey\b|\b(?:Your|Demo|Delete) Key\b|\bNo Key yet\b/;
function lintAll(text: string): LintViolation[] {
  const out = lintCopy(text);
  const m = text.match(RENAME);
  if (m) out.push({ id: 'old-name', match: m[0], why: 'renamed: use Silver Mirror / Your reading / Demo reading / Delete my reading / No reading yet' });
  return out;
}

function lintCode(file: string): Hit[] {
  const src = readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const lines = src.split('\n');
  const hits: Hit[] = [];
  const check = (node: ts.Node, text: string) => {
    if (!text.trim() || looksLikeCode(text.trim())) return;
    const line = sf.getLineAndCharacterOfPosition(node.getStart()).line + 1;
    // Third-party data quoted verbatim (e.g. a retailer's product title) is marked on the same or previous line.
    if (`${lines[line - 2] ?? ''}${lines[line - 1]}`.includes('lint-claims:allow')) return;
    for (const v of lintAll(text)) hits.push({ file, line, text: text.trim().slice(0, 100), v });
  };
  const visit = (node: ts.Node) => {
    if ((ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) && !isCodeString(node)) check(node, node.text);
    else if (ts.isTemplateExpression(node)) check(node, [node.head.text, ...node.templateSpans.map((s) => s.literal.text)].join(' X '));
    else if (ts.isJsxText(node)) check(node, node.text);
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return hits;
}

function lintDoc(file: string): Hit[] {
  const hits: Hit[] = [];
  let inFence = false;
  readFileSync(file, 'utf8').split('\n').forEach((raw, i) => {
    if (raw.trim().startsWith('```')) { inFence = !inFence; return; }
    // Lines quoting the banned list itself are allowed when marked.
    if (inFence || raw.includes('lint-claims:allow')) return;
    const line = raw.replace(/`[^`]*`/g, ' ');
    for (const v of lintAll(line)) hits.push({ file, line: i + 1, text: raw.trim().slice(0, 100), v });
  });
  return hits;
}

export function runLint(): { files: number; hits: Hit[] } {
  const code = CODE_DIRS.flatMap((d) => walk(join(root, d))).filter((f) => /\.tsx?$/.test(f) && !isTest(f) && !f.endsWith('.d.ts'));
  const docs = [...DOC_FILES.map((f) => join(root, f)).filter(existsSync), ...walk(join(root, 'docs')).filter((f) => /\.(srt|vtt)$/.test(f))];
  return { files: code.length + docs.length, hits: [...code.flatMap(lintCode), ...docs.flatMap(lintDoc)] };
}

const { files, hits } = runLint();
for (const h of hits) console.log(`${relative(root, h.file)}:${h.line}  [${h.v.id}] "${h.v.match}"  ${h.text}`);
console.log(`lint-claims: ${files} files, ${hits.length} violation(s)`);
process.exit(hits.length ? 1 : 0);
