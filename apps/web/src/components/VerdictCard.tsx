import { COPY, type Reason, type Verdict } from '@skinkey/contracts';

const LABEL_ICON: Record<Verdict['label'], string> = { FITS: '✓', CAUTION: '◐', UNKNOWN: '?', MEDICINE: '℞' };

function ReasonRow({ reason, index }: { reason: Reason; index: number }) {
  return (
    <li className="reason">
      <span className="reason-index">{index}</span>
      <span className="reason-text">{reason.plain}</span>
      <span className="reason-meta">
        Rule <span className="rule-id">{reason.ruleId}</span>
        {reason.grade ? ` · grade ${reason.grade}` : ''}
        {reason.counted === false ? ' · informational' : ''}
        {reason.sourceUrl && (
          <>
            {' · '}
            <a className="text-link" href={reason.sourceUrl}>
              Where this comes from
            </a>
          </>
        )}
      </span>
    </li>
  );
}

export function VerdictCard({ verdict, note, provenanceOverride }: { verdict: Verdict; note?: string; provenanceOverride?: string }) {
  if (verdict.label === 'MEDICINE') {
    return (
      <article className="verdict" aria-live="polite">
        <div className="verdict-head" data-label="MEDICINE">
          <p className="verdict-label">
            <span aria-hidden="true">{LABEL_ICON.MEDICINE} </span>No verdict
          </p>
          <p className="verdict-sub">{COPY.medicine(verdict.medicineToken ?? 'a gated ingredient')}</p>
        </div>
      </article>
    );
  }
  const strict = verdict.labelChecks.filter((r) => r.counted !== false);
  const info = verdict.labelChecks.filter((r) => r.counted === false);
  const reasons = [...strict, ...verdict.reasons, ...info];
  return (
    <article className="verdict" aria-live="polite">
      <div className="verdict-head" data-label={verdict.label}>
        <p className="verdict-label">
          <span aria-hidden="true">{LABEL_ICON[verdict.label]} </span>
          {verdict.label}
        </p>
        <p className="verdict-sub">{verdict.subtitle}</p>
      </div>
      <div className="verdict-body">
        {reasons.length > 0 ? (
          <ol>
            {reasons.map((r, i) => (
              <ReasonRow key={`${r.ruleId}-${r.ingredient ?? i}`} reason={r} index={i + 1} />
            ))}
          </ol>
        ) : verdict.label === 'FITS' ? (
          <p className="reason-text" style={{ padding: '16px 0' }}>
            {COPY.fitsNoFlags}
          </p>
        ) : null}
        {note && <p className="small muted" style={{ marginTop: 8 }}>{note}</p>}
        <p className="provenance">{provenanceOverride ?? verdict.provenance.line}</p>
      </div>
    </article>
  );
}
