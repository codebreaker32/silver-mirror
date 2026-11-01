# SkinKey v2: build notes

The spec is `research/skinkey_v2_spec.md` and it overrides everything else. Copy rules are in `design/research/00_research_summary_and_design_brief.md` §4. Where the brief and the spec disagree on a fixed string (for example the CAUTION subtitle), the spec wins. Every fixed string is already in `packages/contracts/src/copy.ts` as `COPY`. Import it; don't retype it.

## Ownership map

**Rule:** edit only the files you own. You may add new files anywhere inside your own directories. If you need a change in a shared file, make it additive (a new optional field or a new export) and say so in your final report.

| Owner | Owns (read/write) | Notes |
|---|---|---|
| **APP-CORE** (A1) | `apps/mobile/src/features/{check,share,matches,home}/`<br>`apps/mobile/src/app/(tabs)/**`<br>`apps/mobile/src/app/{check,settings,how}.tsx`<br>`apps/mobile/src/app/_layout.tsx`<br>`apps/mobile/src/app/+native-intent.tsx`<br>`apps/mobile/src/components/**` | Share intent, parser, SKU confirm, verdict sheet, better matches, Home, sample share, Demo Key mode, "How this was made" screen. `src/components/` is the shared UI kit. APP-SCAN may add new files there but must not edit APP-CORE's. |
| **APP-SCAN** (A2) | `apps/mobile/src/features/{scan,tryon,key}/`<br>`apps/mobile/src/app/scan/**`<br>`apps/mobile/src/app/{tryon,key}.tsx` | Consent, capture guide, upload, HD flow, overlay held in memory, Key card, try-on, delete state on the phone, cache-check E2E. Keep the exported signatures in `features/key/index.ts` stable; APP-CORE consumes them. |
| **WORKER** (A3) | `apps/worker/**`<br>`packages/contracts/src/{api,ledger}.ts` | YouCam proxy, limiter, ledger, caps, mock YouCam (`src/mock/`, fixtures in `src/mock/fixtures/`), Claude X3/X4 (`src/claude/`), `/v1/label-check`, and the catalogue endpoints. |
| **RULES** (A4) | `packages/rules/**`<br>`packages/contracts/src/{domain,rules,verdict}.ts`<br>`scripts/lint-claims.mjs`<br>`audit/**` (create it)<br>root `audit` script | Rules engine, bands, label check, medicine gate, `rank()`, the CI suites, the claim linter, `npm run audit`, and `summary.json`. |
| **WEB** (A6) | `apps/web/**` | Landing, `/check`, `/audit`, `/rules`, `/how`, `/r/:token`. |
| CATALOG (A5) | `data/catalog/**`<br>`packages/contracts/src/catalog.ts` | The on-disk row schema is `CatalogProduct` (snake_case, following X1). |
| DESIGN (A7) | `design/system/**` | `packages/design` re-exports these tokens. Never copy token values. |
| Scaffold (shared) | Root `package.json`, `tsconfig.base.json`, `vitest.config.ts`, `.editorconfig`, `.gitignore`, `scripts/gen-dev-vars.mjs`<br>`packages/design/**`<br>`packages/contracts/src/{copy,demo,index}.ts`<br>`apps/mobile/{app.json,package.json,tsconfig.json}`<br>`apps/mobile/src/{lib/api.ts,theme/}` | Additive changes only. `copy.ts` changes only to match the spec. |

**Dependencies:** add them with `npm install <pkg> -w @skinkey/<workspace>`, run from the repo root. For mobile native modules, run `npx expo install <pkg>` from inside `apps/mobile`. Never hand-edit `package-lock.json`. Avoid adding dependencies when you can: parallel installs race on the lockfile.

## Layout

```
apps/mobile      Expo SDK 58 (RN 0.88, React 19.3), expo-router. Routes in src/app, features in src/features
apps/worker      Cloudflare Worker (Hono). src/index.ts router, src/mock (mock YouCam), src/youcam, src/claude
apps/web         Vite 8 + React 19.3 + react-router 8. Static, deploys to Cloudflare Pages (public/_redirects)
packages/contracts  zod schemas + types for every Worker route (`routes` map), KeyProfile, Verdict, ledger, COPY, DEMO_KEY
packages/rules      pure TS engine (signatures with TODO bodies); depends only on zod + contracts (types)
packages/design     re-exports design/system/tokens: `@skinkey/design` (RN theme.ts), `@skinkey/design/web`, `@skinkey/design/tokens.css`
scripts/            gen-dev-vars.mjs, lint-claims.mjs (stub)
```

The mobile route stubs are `(tabs)/index` (Home), `check`, `scan/{index,capture,processing,result}`, `tryon`, `key`, `settings` and `how`. The Expo template keeps routes under `src/app` and features under `src/features`, and `@/*` maps to `src/*`.

## Contract summary (`packages/contracts/src/api.ts`)

| Route | Request → Response |
|---|---|
| `POST /v1/scan/start` | `ScanStartRequest {image, consent}` → `{scanId, upload: UploadSlot, caps}`. The phone PUTs the JPG straight to the YouCam presigned URL, then deletes the capture URI. |
| `POST /v1/scan/submit` | `{scanId}` → `ScanStatusResponse` |
| `GET /v1/scan/:id` | `ScanStatusResponse {steps[upload,analyse,read,delete], deleteState, key?, overlayJpegBase64?, error?, ledger}` |
| `POST /v1/tryon` | `TryonStartRequest {productId, mode, shadeName?, image 768×1024, consent}` → `{tryonId, upload, caps}` |
| `POST /v1/tryon/:id/submit`, `GET /v1/tryon/:id` | `TryonStatusResponse {steps[upload,tone,render,delete], renders[≤2]{shadeName, imageBase64}, deleteState, ledger}`. The tone hex is never returned. |
| `POST /v1/resolve` | `{source, text?, url?, imageBase64?}` → `{outcome: match\|candidates\|unknown\|not_skincare, candidates[≤3], extractedTitle, store, catalogCount, ledger}` |
| `POST /v1/label-ocr` | `{imageBase64, mediaType}` → `{tokens[{raw, cosingName, confidence, uncertain}], unreadableRegions, ledger}` |
| `POST /v1/label-check` | `{items[{id, claims, inci}], includeProfiles}` → `{rulesetHash, results[{id, hits, medicineToken?, profileFlags?}]}` |
| `GET /v1/rules` | `{rulesetHash, rules, bandCutoffs, profiles, facetMap, banner}` |
| `GET /v1/catalog/search`, `GET /v1/catalog/:id` | `{catalogCount, results: ProductSummary[]}` / `{product: CatalogProduct}` |

- **Errors:** `ApiError {error: {code, message}}`.
- **Headers:** install token in `x-skinkey-install` (HMAC-signed); `idempotency-key` on creates.
- **Mobile client:** the typed client is `apps/mobile/src/lib/api.ts` → `call('scanStart', {body})`.
- **`ui_score` firewall:** `RawScoreReading` is `.strict()`, so a `ui_score` field fails to parse. The Worker strips `ui_score` before calling `buildKeyProfile`.
- **Key profile on the phone:** bands, pore sub-regions, zone labels (only if G1 passes), scan date, self-reported flags and `photoDeleted`. No numbers.

## Commands (from the repo root)

```
npm install                 # all workspaces
npm run typecheck           # every workspace (passes on the skeleton)
npm test                    # vitest, projects = packages/* + apps/*
npm run lint                # workspace lint + claim linter (stub)
npm run gen:devvars         # writes apps/worker/.dev.vars from .env (0600, gitignored, values never printed)
npm run dev:worker          # wrangler dev on :8787, MOCK_YOUCAM=1 by default
npm run dev:web             # vite on :5173 (VITE_WORKER_URL overrides the Worker URL)
npm run dev:mobile          # expo start (needs a dev client; expo-share-intent doesn't run in Expo Go)
```

## Mobile

- **Build** (spec §12 toolchain):

  ```
  cd apps/mobile
  JAVA_HOME=/home/aman/jdks/jdk17 npx expo prebuild -p android
  cd android && ./gradlew assembleRelease
  ```

  Install through Windows `adb.exe`. For the dev loop, run `adb reverse tcp:8787 tcp:8787` so that `extra.workerUrl` (`http://localhost:8787`) reaches the Worker.
- **Package id:** `app.skinkey`. The scheme is `skinkey`.
- **Config plugins:** expo-router, expo-splash-screen, expo-share-intent (`text/*`, `image/*`), expo-camera (no audio), expo-secure-store, expo-font, expo-updates.
- **Native modules installed:** expo-share-intent 9.0.0, expo-camera, expo-image, expo-image-manipulator (768×1024 resize), expo-secure-store, expo-file-system, expo-haptics, expo-updates, expo-dev-client, expo-crypto, @expo-google-fonts/newsreader, @expo-google-fonts/commissioner.
- **expo-file-system on SDK 58** uses the new API: `new File(uri).delete()`. `deleteAsync` lives only in `expo-file-system/legacy`.
- **Theme:** `useTheme()` from `@/theme/ThemeProvider` gives you the `SkinKeyTheme` from `@skinkey/design`. Fonts load in `_layout.tsx` through `fontAssets`.
- **Share intent:** `ShareIntentProvider` is in the root layout. `+native-intent.tsx` sends share deep links to `/check`. Read the payload with `useShareIntentContext()`.
- **Debug APK (verified 2026-11-01, iteration 7):** `scripts/build-android.sh`. It uses the SDK at `~/android-sdk` (cmdline-tools latest, platform-tools, platforms 36 + 37 (Gradle pulled 37), build-tools 36) and system OpenJDK 17, then runs `expo prebuild` and `./gradlew assembleDebug -PreactNativeArchitectures=arm64-v8a`. A clean build takes about 8 minutes.
  - Output: `apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk` (~106 MB, `app.skinkey` 0.1.0, targetSdk 36, arm64 only). `android/` is gitignored.
  - This is a **dev-client** build: it carries no JS bundle and loads JS from Metro (`npm run dev:mobile` + `adb reverse tcp:8081 tcp:8081 && adb reverse tcp:8787 tcp:8787`). Standalone demo APK (verified): `cd apps/mobile/android && ./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a` → `app/build/outputs/apk/release/app-release.apk` (~45 MB, embeds `index.android.bundle`, debug-signed, ~5 min). The bundle points at `http://localhost:8787`, so the phone still needs `adb reverse tcp:8787 tcp:8787` to a running Worker.
- **Verified:** `expo export -p android` bundles cleanly, including `@skinkey/design` → `design/system/tokens/theme.ts`. `expo-doctor` passes 20/20.

## Worker

- **`wrangler.toml`:**
  - No account id.
  - KV binding `KV` (local simulated id).
  - Vars: `MOCK_YOUCAM=1`, `YOUCAM_BASE_URL`, `CLAUDE_MODEL=claude-opus-5-5`, `SCAN_CAP=1`, `TRYON_CAP=3`, `AFFILIATE_NYKAA=off`.
- **Secrets:** `YOUCAM_API_KEY`, `YOUCAM_SECRET_KEY`, `ANTHROPIC_API_KEY` and `INSTALL_HMAC_SECRET` come from `.dev.vars` locally and from `wrangler secret put` when deployed. Never log them, and never return them.
- **Mock first:** tests and CI must never call the real YouCam API. The balance is 1,040 units (`research/youcam_live_facts.md`). The mock is mounted at `/mock-youcam/*`.
- **Claude:** `@anthropic-ai/sdk` 1.3.0 is installed. Read the claude-api skill README before writing Claude code:
  - Structured outputs through `output_config.format`.
  - `thinking: {type: "adaptive"}`.
  - Effort `low` for X3 and `medium` for X4.
  - `fallbacks: "default"` with beta `server-side-fallback-2026-07-01`.
  - Check `stop_reason === "refusal"` before reading content.
  - No temperature, and no forced `tool_choice`.
- **Claude never decides a verdict.**
- **Catalogue:** `data/catalog/catalog.json` doesn't exist yet. The Worker must load it in a way that still typechecks when the file is absent (for example a build step that copies it into `src/generated/`).

## Not done by the scaffold

- No git repo has been initialised.
- The web app has no visual design yet.
- `packages/rules` bodies throw `TODO`.
- The Worker routes return 501.
- The mock YouCam server returns 501.
