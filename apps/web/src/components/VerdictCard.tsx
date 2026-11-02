import { COPY, type Reason, type Verdict, type VerdictLabel } from '@skinkey/contracts';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { VerdictIcon } from './Icon';

/** Rules write "<reading lead>. <fact>" in one string (same split as the app's verdict sheet). */
export function splitPlain(plain: string): { lead: string | null; fact: string } {
  const text = plain.trim();
  const m = /^((?:[^.]*?\breading: [^.]*)|(?:Listing says '[^']*'))\.\s+(.+)$/s.exec(text);
  return m ? { lead: `${m[1]}.`, fact: m[2]! } : { lead: null, fact: text };
}

/** Strict label checks first, then fit reasons, then informational label notes; one row per rule and ingredient. */
export function orderedReasons(v: Pick<Verdict, 'reasons' | 'labelChecks'>): Reason[] {
  const seen = new Set<string>();
  return [...v.labelChecks.filter((r) => r.counted !== false), ...v.reasons, ...v.labelChecks.filter((r) => r.counted === false)].filter((r) => {
    const id = `${r.ruleId}|${r.ingredient ?? ''}`;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

/**
 * Verdict head (DESIGN.md §8.4): radius 20, a disc holding the verdict icon, the caps label in the verdict colour, the
 * sentence in serif. Dashed edge for UNKNOWN and for name-only checks. MEDICINE has no box and no label.
 */
export function VerdictHead({
  label,
  line,
  qualifier,
  demo,
}: {
  label: VerdictLabel;
  line: string;
  qualifier?: string | null;
  demo?: boolean;
}) {
  if (label === 'MEDICINE')
    return (
      <div className="medicine-gate">
        <VerdictIcon label="MEDICINE" size={32} />
        <p className="medicine-line">{line}</p>
      </div>
    );
  return (
    <div className="verdict-head" data-label={label} data-dashed={qualifier ? 'true' : undefined}>
      <div className="verdict-head-top">
        <span className="verdict-disc">
          <VerdictIcon label={label} />
        </span>
        <p className="verdict-label">
          {label}
          {qualifier && <span className="verdict-qualifier"> · {qualifier}</span>}
        </p>
        {demo && <span className="demo-badge">{COPY.reading.demo}</span>}
      </div>
      <p className="verdict-line">{line}</p>
    </div>
  );
}

export function ReasonList({ reasons, heading = true }: { reasons: { key: string; reading: string | null; fact: string; tag: ReactNode }[]; heading?: boolean }) {
  if (!reasons.length) return null;
  return (
    <section className="reasons" aria-label={`Why: ${reasons.length} reason${reasons.length === 1 ? '' : 's'}`}>
      {heading && (
        <h3 className="reasons-head">
          Why · {reasons.length} reason{reasons.length === 1 ? '' : 's'}
        </h3>
      )}
      <ul>
        {reasons.map((r) => (
          <li key={r.key} className="reason">
            {r.reading && <p className="reason-reading">{r.reading}</p>}
            <p className="reason-fact">{r.fact}</p>
            <p className="reason-tag">{r.tag}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export type LedgerKey = 'Reading' | 'Product' | 'Rules' | 'Limits';
export interface LedgerRow {
  key: LedgerKey;
  value: string;
  sub?: string | null;
  links?: { label: string; href: string; internal?: boolean }[];
}

/** Provenance ledger (DESIGN.md §8.6): a receipt card, sentence-case keys in a 96px column, links after the row text. */
export function Ledger({ rows, title = 'Where this comes from' }: { rows: LedgerRow[]; title?: string }) {
  return (
    <section className="ledger" aria-label={title}>
      <h3 className="ledger-title">{title}</h3>
      <dl>
        {rows.map((r) => (
          <div key={r.key} className="ledger-row">
            <dt>{r.key}</dt>
            <dd>
              <span className="ledger-value">{r.value}</span>
              {r.sub && <span className="ledger-sub">{r.sub}</span>}
              {r.links?.map((l) =>
                l.internal ? (
                  <Link key={l.href} className="text-link ledger-link" to={l.href}>
                    {l.label}
                  </Link>
                ) : (
                  <a key={l.href} className="text-link ledger-link" href={l.href} rel="noopener noreferrer">
                    {l.label}
                  </a>
                ),
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

const shortHash = (h: string) => h.slice(0, 7);

export function rulesRow(v: Pick<Verdict, 'reasons' | 'labelChecks' | 'provenance'>): LedgerRow {
  const reasons = orderedReasons(v);
  return {
    key: 'Rules',
    value: `Published rules (version ${shortHash(v.provenance.rulesetHash)})`,
    sub: reasons.length ? reasons.map((r) => `${r.ruleId}${r.grade ? ` (${r.grade})` : ''}`).join(' · ') : null,
    links: [{ label: 'Every rule', href: '/rules', internal: true }],
  };
}

export const limitsRow: LedgerRow = { key: 'Limits', value: COPY.accuracyNote, sub: COPY.footer };

export function reasonViews(v: Pick<Verdict, 'reasons' | 'labelChecks'>) {
  return orderedReasons(v).map((r, i) => {
    const { lead, fact } = splitPlain(r.plain);
    const isLabel = r.kind === 'LABEL_CHECK';
    return {
      key: `${r.ruleId}-${r.ingredient ?? i}`,
      reading: lead,
      fact,
      tag: (
        <>
          {isLabel ? (r.counted === false ? 'Label check · for information · ' : 'Label check · ') : ''}
          Rule <span className="rule-id">{r.ruleId}</span>
          {r.grade ? ` · grade ${r.grade}` : ''}
          {r.sourceUrl && (
            <>
              {' · '}
              <a className="text-link" href={r.sourceUrl} rel="noopener noreferrer">
                Source
              </a>
            </>
          )}
        </>
      ),
    };
  });
}

/**
 * The whole verdict: head, then reasons, then the note, then the ledger (or the engine's one-line provenance when no
 * ledger is given). Reading order follows DESIGN.md §9.4.
 */
export function VerdictCard({
  verdict,
  note,
  provenanceOverride,
  ledger,
  demo,
}: {
  verdict: Verdict;
  note?: string;
  provenanceOverride?: string;
  ledger?: LedgerRow[];
  demo?: boolean;
}) {
  if (verdict.label === 'MEDICINE')
    return (
      <article className="verdict" aria-live="polite">
        <VerdictHead label="MEDICINE" line={COPY.medicine(verdict.medicineToken ?? 'a gated ingredient')} />
      </article>
    );
  const nameOnly = 'basis' in verdict && verdict.basis === 'name_only' && verdict.label !== 'UNKNOWN';
  const reasons = reasonViews(verdict);
  return (
    <article className="verdict" aria-live="polite">
      <VerdictHead label={verdict.label} line={verdict.subtitle} qualifier={nameOnly ? 'based on product name only' : null} demo={demo} />
      {reasons.length > 0 ? (
        <ReasonList reasons={reasons} />
      ) : verdict.label === 'FITS' ? (
        <p className="reason-none">{COPY.fitsNoFlags}</p>
      ) : null}
      {note && <p className="verdict-note">{note}</p>}
      {ledger ? <Ledger rows={ledger} /> : <p className="provenance">{provenanceOverride ?? verdict.provenance.line}</p>}
    </article>
  );
}
