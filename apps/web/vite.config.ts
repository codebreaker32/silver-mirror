import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const auditDir = resolve(repoRoot, 'audit');
const VIRTUAL_ID = 'virtual:skinkey-audit';
const RESOLVED_ID = `\0${VIRTUAL_ID}`;

const readIfExists = (p: string) => (existsSync(p) ? readFileSync(p, 'utf8') : null);

const AUDIT_TAGS = ['audit-method-frozen', 'rules-frozen', 'audit-run'];
/** The audit outputs the page may link to (audit/METHOD.md). */
const AUDIT_FILES = ['results.csv', 'review.md', 'METHOD.md'];

/** Audit tag → short commit. Git first; the build VM has no .git, so audit/tags.json (written after tagging) is the fallback. */
function gitTags(): Record<string, string | null> {
  let recorded: Record<string, unknown> = {};
  try {
    recorded = JSON.parse(readIfExists(resolve(auditDir, 'tags.json')) ?? '{}');
  } catch {
    recorded = {};
  }
  return Object.fromEntries(
    AUDIT_TAGS.map((tag) => {
      try {
        const sha = execFileSync('git', ['rev-parse', '--short', `${tag}^{commit}`], { cwd: repoRoot, stdio: ['ignore', 'pipe', 'ignore'] });
        return [tag, sha.toString().trim()];
      } catch {
        const r = recorded[tag];
        return [tag, typeof r === 'string' && /^[0-9a-f]{7,40}$/.test(r) ? r.slice(0, 7) : null];
      }
    }),
  );
}

/**
 * Reads audit/summary.json, audit/results.csv and the audit git tags into a virtual module, and copies the audit files
 * the page links to into the build. /audit renders only from this module; a missing summary.json gives the honest empty
 * state.
 */
function auditData(): Plugin {
  let command: 'build' | 'serve' = 'serve';
  return {
    name: 'skinkey-audit',
    configResolved(c) {
      command = c.command;
    },
    resolveId: (id) => (id === VIRTUAL_ID ? RESOLVED_ID : null),
    load(id) {
      if (id !== RESOLVED_ID) return null;
      const summaryPath = resolve(auditDir, 'summary.json');
      this.addWatchFile(summaryPath);
      const rawSummary = readIfExists(summaryPath);
      let summary: unknown = null;
      try {
        summary = rawSummary ? JSON.parse(rawSummary) : null;
      } catch {
        summary = { __invalid: true };
      }
      const csv = readIfExists(resolve(auditDir, 'results.csv'));
      const files: Record<string, string> = {};
      for (const f of AUDIT_FILES) {
        const text = readIfExists(resolve(auditDir, f));
        if (text == null) continue;
        if (command === 'build') this.emitFile({ type: 'asset', fileName: `audit/${f}`, source: text });
        files[f] = `/audit/${f}`;
      }
      return [
        `export const summaryJson = ${JSON.stringify(summary)};`,
        `export const resultsCsv = ${JSON.stringify(csv)};`,
        `export const auditFiles = ${JSON.stringify(files)};`,
        `export const gitTags = ${JSON.stringify(gitTags())};`,
      ].join('\n');
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const name = (req.url ?? '').startsWith('/audit/') ? (req.url ?? '').slice('/audit/'.length) : null;
        if (!name || !AUDIT_FILES.includes(name)) return next();
        const text = readIfExists(resolve(auditDir, name));
        if (text == null) return next();
        res.setHeader('cache-control', 'no-store');
        res.setHeader('content-type', name.endsWith('.csv') ? 'text/csv; charset=utf-8' : 'text/markdown; charset=utf-8');
        res.end(text);
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), auditData()],
  server: { port: 5173 },
  test: { name: 'web', environment: 'node', include: ['src/**/*.test.ts'] },
});
