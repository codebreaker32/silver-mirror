import { COPY, type Band, type CatalogProduct, type Concern, type KeyProfile, type Reason, type Verdict, type VerdictLabel } from '@skinkey/contracts';
import { readingLine, shortDate, twoDigit } from './format';

export type Tone = 'fits' | 'caution' | 'unknown' | 'medicine';

export interface ReasonView {
  id: string;
  index: string;
  reading: string | null;
  fact: string;
  ruleTag: string;
  kindNote: string | null;
  info: boolean;
  chip: { concern: Concern; level: Band; selfReported: boolean } | null;
  glyphZone: string | null;
  a11y: string;
}

export interface LedgerLink {
  label: string;
  url: string;
}

export interface LedgerRow {
  key: 'SKIN' | 'PRODUCT' | 'RULES' | 'LIMITS';
  value: string;
  sub: string | null;
  links: LedgerLink[];
  a11y: string;
}

export interface VerdictView {
  label: VerdictLabel;
  tone: Tone;
  labelText: string | null;
  subtitle: string;
  headA11y: string;
  showReasons: boolean;
  reasons: ReasonView[];
  emptyReasonsNote: string | null;
  provenanceLine: string | null;
  ledger: LedgerRow[];
  fixedLines: string[];
  showMatches: boolean;
  announce: string;
}

export interface PresentContext {
  key: KeyProfile | null;
  product: CatalogProduct | null;
  catalogCount: number | null;
  labelTokenCount?: number;
}

const TITLE_CASE: Record<VerdictLabel, string> = { FITS: 'Fits', CAUTION: 'Caution', UNKNOWN: 'Unknown', MEDICINE: 'Medicine' };

export const shortHash = (hash: string) => hash.slice(0, 7);

function subtitleFor(v: Verdict): string {
  if (v.label === 'MEDICINE') return COPY.medicine(v.medicineToken ?? 'a medicine ingredient');
  return COPY.subtitle[v.label];
}

function orderedReasons(v: Verdict): Reason[] {
  const strict = v.labelChecks.filter((r) => r.counted);
  const info = v.labelChecks.filter((r) => !r.counted);
  const seen = new Set<string>();
  return [...strict, ...v.reasons, ...info].filter((r) => {
    const id = `${r.ruleId}|${r.ingredient ?? ''}`;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

function reasonView(r: Reason, i: number, total: number, scanDate: string | null): ReasonView {
  const fact = r.plain.trim();
  const rawReading = readingLine(r.reading, scanDate);
  const duplicated = /reading:|^listing says/i.test(fact);
  const reading = duplicated ? null : rawReading;
  const isLabel = r.kind === 'LABEL_CHECK';
  const info = isLabel && !r.counted;
  const kindNote = isLabel ? (info ? 'Label check · for information' : 'Label check') : null;
  const ruleTag = `Rule ${r.ruleId}${r.grade ? ` · grade ${r.grade}` : ''}`;
  const chip =
    r.reading?.on === 'band' ? { concern: r.reading.concern, level: r.reading.level, selfReported: r.reading.selfReported } : null;
  const a11y = [`Reason ${i + 1} of ${total}.`, kindNote ? `${kindNote}.` : null, reading, fact, `${ruleTag}.`]
    .filter(Boolean)
    .join(' ');
  return { id: `${r.ruleId}-${i}`, index: twoDigit(i + 1), reading, fact, ruleTag, kindNote, info, chip, glyphZone: r.glyphZone ?? null, a11y };
}

function skinRow(key: KeyProfile | null): LedgerRow {
  if (!key) {
    const value = 'No Key on this phone';
    const sub = 'Scan for reasons based on your readings.';
    return { key: 'SKIN', value, sub, links: [], a11y: `Skin: ${value}. ${sub}` };
  }
  if (key.source === 'demo') {
    const value = 'Demo Key: labelled sample readings, not a scan';
    const sub = 'No photo taken';
    return { key: 'SKIN', value, sub, links: [], a11y: `Skin: ${value}. ${sub}` };
  }
  const value = `Measured by YouCam Skin Analysis HD, ${shortDate(key.scanDate)}`;
  const parts = [key.photoDeleted ? 'Photo deleted · score bands only' : COPY.deleteFailed];
  if (key.selfReported.length) parts.push(`${key.selfReported.length} band${key.selfReported.length > 1 ? 's' : ''} ${COPY.selfReported}`);
  const sub = parts.join(' · ');
  return { key: 'SKIN', value, sub, links: [], a11y: `Skin: ${value}. ${sub}` };
}

function productRow(v: Verdict, ctx: PresentContext): LedgerRow {
  const src = v.provenance.inciSource;
  const url = v.provenance.inciSourceUrl ?? ctx.product?.source_url;
  if (src === 'catalog_verified') {
    const value = 'Ingredient list from the SkinKey catalogue';
    const sub = 'Checked by hand against the brand or retailer page';
    const links = url ? [{ label: 'Ingredient list source', url }] : [];
    return { key: 'PRODUCT', value, sub, links, a11y: `Product: ${value}. ${sub}` };
  }
  if (src === 'label_photo_confirmed') {
    const value = COPY.labelPhotoProvenance;
    const sub = ctx.labelTokenCount ? `${ctx.labelTokenCount} ingredients` : null;
    return { key: 'PRODUCT', value, sub, links: [], a11y: `Product: ${value}${sub ? ` ${sub}` : ''}` };
  }
  const value = 'Product name only';
  const sub = ctx.catalogCount != null ? COPY.catalogCount(ctx.catalogCount) : null;
  return { key: 'PRODUCT', value, sub, links: [], a11y: `Product: ${value}.${sub ? ` ${sub}` : ''}` };
}

function rulesRow(v: Verdict, reasons: Reason[]): LedgerRow {
  const value = `Published rules v${shortHash(v.provenance.rulesetHash)}`;
  const sub = reasons.length ? reasons.map((r) => `${r.ruleId}${r.grade ? ` (${r.grade})` : ''}`).join(' · ') : null;
  const links: LedgerLink[] = [];
  for (const r of reasons) {
    if (r.sourceUrl && !links.some((l) => l.url === r.sourceUrl)) links.push({ label: `${r.ruleId} source`, url: r.sourceUrl });
    if (r.inciSourceUrl && !links.some((l) => l.url === r.inciSourceUrl)) links.push({ label: `${r.ruleId} ingredient name`, url: r.inciSourceUrl });
  }
  return { key: 'RULES', value, sub, links, a11y: `Rules: ${value}.${sub ? ` ${sub}.` : ''}` };
}

function composeProvenance(v: Verdict, key: KeyProfile | null): string {
  const p = v.provenance;
  const parts: string[] = [];
  if (key?.source === 'youcam_hd') parts.push(`Measured by YouCam Skin Analysis HD, ${shortDate(key.scanDate)}`);
  else if (key?.source === 'demo') parts.push('Demo Key (sample readings)');
  if (key?.source === 'youcam_hd') parts.push(key.photoDeleted ? 'photo deleted' : 'photo delete not confirmed');
  if (p.inciSource === 'label_photo_confirmed') parts.push(COPY.labelPhotoProvenance.replace(/\.$/, ''));
  parts.push(`rules v${shortHash(p.rulesetHash)}`);
  return parts.join(' · ');
}

export function presentVerdict(v: Verdict, ctx: PresentContext): VerdictView {
  const tone = v.label.toLowerCase() as Tone;
  const subtitle = subtitleFor(v);
  const medicine = v.label === 'MEDICINE';
  const labelText = medicine ? null : v.label;
  const headA11y = medicine ? subtitle : `${TITLE_CASE[v.label]}. ${subtitle}`;
  const fixedLines = [COPY.footer, COPY.notAffiliated];

  if (medicine) {
    return {
      label: v.label,
      tone,
      labelText,
      subtitle,
      headA11y,
      showReasons: false,
      reasons: [],
      emptyReasonsNote: null,
      provenanceLine: null,
      ledger: [],
      fixedLines,
      showMatches: false,
      announce: headA11y,
    };
  }

  const ordered = orderedReasons(v);
  const scanDate = ctx.key?.source === 'youcam_hd' ? ctx.key.scanDate : null;
  const reasons = ordered.map((r, i) => reasonView(r, i, ordered.length, scanDate));
  const emptyReasonsNote = v.label === 'FITS' && reasons.length === 0 ? COPY.fitsNoFlags : null;
  const provenanceLine = v.provenance.line?.trim() || composeProvenance(v, ctx.key);
  const ledger = [skinRow(ctx.key), productRow(v, ctx), rulesRow(v, ordered), { key: 'LIMITS', value: COPY.accuracyNote, sub: null, links: [], a11y: `Limits: ${COPY.accuracyNote}` } satisfies LedgerRow];

  return {
    label: v.label,
    tone,
    labelText,
    subtitle,
    headA11y,
    showReasons: v.label !== 'UNKNOWN' || reasons.length > 0,
    reasons,
    emptyReasonsNote,
    provenanceLine,
    ledger,
    fixedLines,
    showMatches: true,
    announce: reasons[0] ? `${headA11y} ${reasons[0].a11y}` : headA11y,
  };
}

export type LitZone = 'forehead' | 'nose' | 'leftCheek' | 'rightCheek' | 'chin';

const ALL: LitZone[] = ['forehead', 'nose', 'leftCheek', 'rightCheek', 'chin'];
const ZONE_MAP: Record<string, LitZone[]> = {
  forehead: ['forehead'],
  nose: ['nose'],
  cheek: ['leftCheek', 'rightCheek'],
  cheeks: ['leftCheek', 'rightCheek'],
  chin: ['chin'],
  t_zone: ['forehead', 'nose', 'chin'],
  u_zone: ['leftCheek', 'rightCheek', 'chin'],
  whole: ALL,
};

/** Zones the Key glyph lights for the first reading-based reason (spec §2B.3). */
export function litZones(v: Verdict): LitZone[] {
  for (const r of [...v.reasons, ...v.labelChecks]) {
    const key = r.glyphZone ?? (r.reading?.on === 'zone' ? r.reading.zone : r.reading?.on === 'band' ? r.reading.region : null);
    if (key && ZONE_MAP[key]) return ZONE_MAP[key];
  }
  return [];
}

export const reasonsHeading = (n: number) => `Why · ${n} reason${n === 1 ? '' : 's'}`;
