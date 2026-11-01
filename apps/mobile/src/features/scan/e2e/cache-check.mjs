#!/usr/bin/env node
// Device check (spec §9): after a scan and a try-on, the app's cache and files folders hold no jpg/png/webp.
// Usage: node apps/mobile/src/features/scan/e2e/cache-check.mjs   (ADB=adb.exe on WSL; needs a debuggable build for run-as)
import { execFileSync } from 'node:child_process';

const adb = process.env.ADB ?? (process.env.WSL_DISTRO_NAME ? 'adb.exe' : 'adb');
const pkg = process.env.APP_ID ?? 'app.skinkey';

const out = execFileSync(adb, ['shell', 'run-as', pkg, 'find', 'cache', 'files', '-type', 'f'], { encoding: 'utf8' });
const files = out.split(/\r?\n/).filter(Boolean);
const images = files.filter((f) => /\.(jpe?g|png|webp|heic)$/i.test(f));

console.log(`${pkg}: ${files.length} files in cache/ and files/, ${images.length} images`);
for (const f of images) console.log(`  image: ${f}`);
process.exit(images.length === 0 ? 0 : 1);
