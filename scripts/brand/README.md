# Brand asset pipeline (Silver Mirror)

Both scripts run on the build VM, never locally.

| Script | Makes | Needs |
|---|---|---|
| `wordmark_outline.py` | `apps/mobile/src/brand/wordmarkPaths.ts`, `design/brand/wordmark.svg`: "Silver Mirror" outlined from `NotoSerifDisplay_400Regular.ttf` with its GPOS kerning | Python 3 + fontTools. The VM has no pip; the wheel is unpacked at `/tmp/ftlib/lib` (re-create with the PyPI wheel if `/tmp` was cleared) |
| `build-brand.mjs` | `design/brand/*.svg` sources and `apps/mobile/assets/images/{icon, android-icon-foreground, android-icon-background, android-icon-monochrome, splash-icon, splash-icon-dark, favicon}.png`, plus `design/brand/png/` previews and `brand-sheet.png` | Node 24 (type stripping for `geometry.ts`), `sharp` (already in node_modules) |

```sh
scripts/remote.sh --pull apps/mobile/src/brand/wordmarkPaths.ts --pull design/brand --pull apps/mobile/assets/images -- \
  'PYTHONPATH=/tmp/ftlib/lib python3 scripts/brand/wordmark_outline.py && node scripts/brand/build-brand.mjs'
```

Geometry lives in `apps/mobile/src/brand/geometry.ts`; colours come from the token file (`semantic.color.<mode>.mark`). Change either, re-run, commit the outputs.
