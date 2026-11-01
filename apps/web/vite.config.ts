import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const auditDir = resolve(repoRoot, 'audit');
const VIRTUAL_ID = 'virtual:skinkey-audit';
const RESOLVED_ID = `\0${VIRTUAL_ID}`;
const FRAME_ROUTE = '/__audit-file/';

const readIfExists = (p: string) => (existsSync(p) ? readFileSync(p, 'utf8') : null);

const IMAGE_RE = /\.(png|jpe?g|webp)$/i;
const AUDIT_TAGS = ['frame-frozen', 'rules-frozen', 'rows-frozen', 'audit-run'];

/** Only images inside the repo's audit/ and data/ trees may be copied or served. */
function auditFilePath(rel: string): string | null {
  const abs = resolve(repoRoot, rel);
  const allowed = [auditDir, resolve(repoRoot, 'data')].some((d) => abs.startsWith(d + sep));
  return allowed && existsSync(abs) && statSync(abs).isFile() ? abs : null;
}

function imagesUnder(rel: string): string[] {
  const root = resolve(repoRoot, rel);
  if (!root.startsWith(resolve(repoRoot, 'data/frame') + sep) || !existsSync(root) || !statSync(root).isDirectory()) return [];
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const f of readdirSync(dir).sort()) {
      const full = join(dir, f);
      if (statSync(full).isDirectory()) walk(full);
      else if (IMAGE_RE.test(f)) out.push(relative(repoRoot, full));
    }
  };
  walk(root);
  return out;
}

/** Frame screenshots (every image in each frame dir named by summary.json) plus screenshots cited in results.csv. */
function auditImagePaths(summary: unknown, csv: string | null): { frame: string[]; cited: string[] } {
  const dirs = (summary as { frame?: { dirs?: { dir?: unknown }[] } } | null)?.frame?.dirs;
  const frame = Array.isArray(dirs) ? dirs.flatMap((d) => (typeof d?.dir === 'string' ? imagesUnder(d.dir) : [])) : [];
  const cited = csv ? [...new Set([...csv.matchAll(/[\w./-]+\.(?:png|jpe?g|webp)/gi)].map((m) => m[0]))] : [];
  return { frame, cited };
}

function gitTags(): Record<string, string | null> {
  return Object.fromEntries(
    AUDIT_TAGS.map((tag) => {
      try {
        const sha = execFileSync('git', ['rev-parse', '--short', `${tag}^{commit}`], { cwd: repoRoot, stdio: ['ignore', 'pipe', 'ignore'] });
        return [tag, sha.toString().trim()];
      } catch {
        return [tag, null];
      }
    }),
  );
}

/**
 * Copies audit/summary.json, audit/results.csv and the screenshots they name into the build, and reads the audit git tags.
 * /audit renders only from this module; a missing summary.json gives the honest empty state.
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
      const csvPath = resolve(auditDir, 'results.csv');
      this.addWatchFile(summaryPath);
      this.addWatchFile(csvPath);
      const rawSummary = readIfExists(summaryPath);
      let summary: unknown = null;
      try {
        summary = rawSummary ? JSON.parse(rawSummary) : null;
      } catch {
        summary = { __invalid: true };
      }
      const csv = readIfExists(csvPath);
      const { frame, cited } = auditImagePaths(summary, csv);
      const imageUrls: Record<string, string> = {};
      [...new Set([...frame, ...cited])].forEach((rel, i) => {
        const abs = auditFilePath(rel);
        if (!abs) return;
        if (command === 'build') {
          const fileName = `audit/img/${String(i).padStart(3, '0')}-${basename(abs)}`;
          this.emitFile({ type: 'asset', fileName, source: readFileSync(abs) });
          imageUrls[rel] = `/${fileName}`;
        } else imageUrls[rel] = FRAME_ROUTE + encodeURIComponent(rel);
      });
      if (csv && command === 'build') this.emitFile({ type: 'asset', fileName: 'audit/results.csv', source: csv });
      return [
        `export const summaryJson = ${JSON.stringify(summary)};`,
        `export const resultsCsv = ${JSON.stringify(csv)};`,
        `export const frameShots = ${JSON.stringify(frame.filter((p) => imageUrls[p]))};`,
        `export const imageUrls = ${JSON.stringify(imageUrls)};`,
        `export const gitTags = ${JSON.stringify(gitTags())};`,
      ].join('\n');
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url ?? '';
        const img = url.startsWith(FRAME_ROUTE) ? decodeURIComponent(url.slice(FRAME_ROUTE.length)) : null;
        const rel = url === '/audit/results.csv' ? 'audit/results.csv' : img && IMAGE_RE.test(img) ? img : null;
        const abs = rel ? auditFilePath(rel) : null;
        if (!abs) return next();
        res.setHeader('cache-control', 'no-store');
        res.end(readFileSync(abs));
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), auditData()],
  server: { port: 5173 },
  test: { name: 'web', environment: 'node', include: ['src/**/*.test.ts'] },
});
