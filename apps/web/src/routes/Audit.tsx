import { COPY } from '@skinkey/contracts';
import { frameShots, gitTags, imageUrls, resultsCsv, summaryJson } from 'virtual:skinkey-audit';
import { Link } from 'react-router';
import { config } from '../config';
import { heatStep, isCounted, labelCheckRows, loadAudit, type AuditRow, type AuditSummary } from '../lib/audit';

const METHOD = [
  {
    tag: 'frame-frozen',
    title: 'Frame',
    body: 'On Flipkart, search “moisturiser” and then “sunscreen” with the “Oily Skin” filter on. Screenshot the first ~40 and ~20 results in page order, with a visible timestamp. Product names are transcribed and checked by a person. Human viewing only: no scraping, no automated access.',
  },
  {
    tag: 'rules-frozen',
    title: 'Rules',
    body: 'Rules and band cutoffs are tuned only on catalogue rows outside the frame, then frozen with their ruleset hash.',
  },
  {
    tag: 'rows-frozen',
    title: 'Rows',
    body: "Every frame product gets a row from the brand's own page. No brand page, or no ingredient list on it, means the row is unverifiable: it counts in N but not in a. A person ticks each verification packet.",
  },
  {
    tag: 'audit-run',
    title: 'Run',
    body: 'npm run audit writes audit/results.csv and audit/summary.json. This page renders only from those two files, copied in at build time.',
  },
];

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }) + ' UTC';
};

export function Audit() {
  const state = loadAudit(summaryJson, resultsCsv);
  return (
    <div className="page">
      <div className="page-head">
        <h1>One tag, six readings.</h1>
        <p>
          Flipkart shows the same products to everyone who picks its “Oily Skin” filter. This audit counts what our published
          rules flag on those products for six YouCam reading profiles, and which listings make a claim their own ingredient
          list doesn't match. Every number on this page comes from the audit script.
        </p>
        <p className="banner">{COPY.auditCaption}</p>
      </div>

      <section className="page-section" aria-labelledby="method-title">
        <h2 id="method-title">Method, fixed before the run</h2>
        <p>Each step is committed and tagged in git before the next one runs. If a count comes out small or zero, it is published anyway.</p>
        <ol className="two-col" style={{ marginTop: 24 }}>
          {METHOD.map((m) => (
            <li key={m.tag} className="panel">
              <p className="ui-title">{m.title}</p>
              <p style={{ marginTop: 8 }}>{m.body}</p>
              <p className="small muted" style={{ marginTop: 12 }}>
                Git tag <strong>{m.tag}</strong>: {gitTags[m.tag] ? <span className="rule-id">{gitTags[m.tag]}</span> : 'not tagged yet'}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {state.kind === 'not_run' && <NotRun />}
      {state.kind === 'invalid' && (
        <section className="page-section">
          <h2>The audit output couldn't be read.</h2>
          <p>audit/summary.json is present but doesn't match the shape this page expects ({state.problem}). No numbers are shown.</p>
        </section>
      )}
      {state.kind === 'ready' && <Results summary={state.summary} rows={state.rows} csvAvailable={state.csvAvailable} />}
    </div>
  );
}

function NotRun() {
  return (
    <section className="page-section" aria-labelledby="notrun-title">
      <h2 id="notrun-title">The audit hasn't run yet.</h2>
      <p>
        There is no audit/summary.json in this build, so there are no counts to show. Results appear here only after the frame,
        rules and rows are frozen and npm run audit has run. We don't write headline numbers before the script does.
      </p>
      <p>
        Meanwhile, the <Link className="text-link" to="/rules">rules</Link> and the reading profiles they run against are
        public.
      </p>
    </section>
  );
}

function Results({ summary, rows, csvAvailable }: { summary: AuditSummary; rows: AuditRow[]; csvAvailable: boolean }) {
  const preview = summary.mode !== 'frame' || !summary.headline;
  const lc = labelCheckRows(rows);
  const checked = summary.population.checked;
  return (
    <>
      <section className="page-section" aria-labelledby="run-title">
        <h2 id="run-title">{preview ? 'Catalogue preview, not the headline' : summary.frame.pilot ? 'Pilot result' : 'Result'}</h2>
        <p className="small muted">
          Generated {fmtDate(summary.generated_at)} · ruleset <span className="rule-id">{summary.ruleset_hash}</span> (v
          {summary.ruleset_version}) · copy set {summary.copy_set}
          {csvAvailable && (
            <>
              {' · '}
              <a className="text-link" href="/audit/results.csv" download>
                results.csv
              </a>
            </>
          )}
        </p>
        {preview && (
          <p className="banner">
            This run is a preview over the catalogue, not the pre-registered Flipkart frame. Use it to see the method working,
            not as a finding.
          </p>
        )}
        {summary.notes.length > 0 && (
          <ul className="stack small" style={{ marginTop: 16, listStyle: 'disc', paddingLeft: 20 }}>
            {summary.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        )}
        {(summary.text.coverage || summary.text.lead || summary.text.label_check) && (
          <div className="stack" style={{ marginTop: 24, maxWidth: '64ch' }}>
            {[summary.text.coverage, summary.text.lead, summary.text.label_check].filter(Boolean).map((t) => (
              <p key={t} className="verdict-sub">
                {t}
              </p>
            ))}
          </div>
        )}
      </section>

      <section className="page-section" aria-labelledby="counts-title">
        <h2 id="counts-title">Coverage</h2>
        <div className="two-col">
          <div className="panel">
            <p className="count-big">
              {summary.frame.a} <span className="muted">of</span> {summary.frame.N}
            </p>
            <p style={{ marginTop: 8 }}>
              Frame products with an ingredient list verified from the brand's own page (frame status: {summary.frame.status}).
            </p>
          </div>
          <div className="panel">
            <p className="count-big">{checked}</p>
            <p style={{ marginTop: 8 }}>
              Products run through the rules in this run. Catalogue: {summary.catalog.rows} rows, {summary.catalog.verified}{' '}
              verified, {summary.catalog.unverified} not yet ticked, {summary.catalog.unverifiable} unverifiable.
              {summary.population.medicine > 0 && ` ${summary.population.medicine} stopped at the medicine gate.`}
            </p>
          </div>
        </div>
      </section>

      <FrameStrip />

      <section className="page-section" aria-labelledby="heat-title">
        <h2 id="heat-title">One tag, six readings</h2>
        <p>
          Products flagged CAUTION under each YouCam reading profile, out of {checked} checked, split by the grade of the
          strongest rule that fired (R regulatory list, L literature, T team rule). Profiles are defined on the{' '}
          <Link className="text-link" to="/rules">rules page</Link>.
        </p>
        <div className="table-scroll">
          <table className="data heatmap">
            <caption className="visually-hidden">CAUTION counts per reading profile</caption>
            <thead>
              <tr>
                <th scope="col">Flagged CAUTION</th>
                {summary.heatmap.map((h) => (
                  <th key={h.profile_id} scope="col">
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">All grades</th>
                {summary.heatmap.map((h) => (
                  <td key={h.profile_id} className={`cell heat-${heatStep(h.CAUTION, checked)}`}>
                    {h.CAUTION}
                  </td>
                ))}
              </tr>
              {(['R', 'L', 'T'] as const).map((g) => (
                <tr key={g}>
                  <th scope="row">Top grade {g}</th>
                  {summary.heatmap.map((h) => (
                    <td key={h.profile_id} className={`cell heat-${heatStep(h.by_top_grade[g], checked)}`}>
                      {h.by_top_grade[g]}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <th scope="row">Rules that fired</th>
                {summary.heatmap.map((h) => (
                  <td key={h.profile_id} className="small">
                    {Object.entries(h.rule_ids)
                      .map(([id, n]) => `${id} ×${n}`)
                      .join(', ') || 'none'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <p className="small muted" style={{ marginTop: 12 }}>
          {summary.text.caption}
        </p>
      </section>

      <section className="page-section" aria-labelledby="lc-title">
        <h2 id="lc-title">Label Check</h2>
        <p>
          <strong>{summary.label_check.c}</strong> listings make a claim their own ingredient list doesn't match (strict rules
          LC-1a, LC-2, LC-3). <strong>{summary.label_check.d}</strong> more have a listed allergen or essential oil under a
          “fragrance-free” claim (LC-1b, informational). Each flagged row is reviewed by a person.
        </p>
        {lc.length === 0 ? (
          <p className="panel-sunken" style={{ marginTop: 16 }}>
            No label-claim hits in this run.
          </p>
        ) : (
          <div className="table-scroll">
            <table className="data">
              <thead>
                <tr>
                  <th scope="col">Product</th>
                  <th scope="col">Rule</th>
                  <th scope="col">Listing says</th>
                  <th scope="col">Ingredient list has</th>
                  <th scope="col">Evidence</th>
                </tr>
              </thead>
              <tbody>
                {lc.map((r, i) => (
                  <tr key={i}>
                    <th scope="row">
                      {r.product_name}
                      <div className="small muted">{r.row_status}</div>
                    </th>
                    <td>
                      <span className="rule-id">{r.rule_id}</span>
                      <div className="small muted">
                        grade {r.grade || 'n/a'}
                        {isCounted(r) ? '' : ' · informational'}
                        {r.contested === 'true' ? ' · contested definition' : ''}
                      </div>
                    </td>
                    <td>{r.claim_quote ? `“${r.claim_quote}”` : r.claim_type}</td>
                    <td>
                      {r.matched_token}
                      {r.position ? <span className="small muted"> (position {r.position})</span> : null}
                    </td>
                    <td className="small">
                      {r.claim_url && (
                        <a className="text-link" href={r.claim_url}>
                          Brand page
                        </a>
                      )}
                      {r.screenshot_path && imageUrls[r.screenshot_path] && (
                        <>
                          {' · '}
                          <a className="text-link" href={imageUrls[r.screenshot_path]}>
                            Screenshot
                          </a>
                        </>
                      )}
                      {' · '}
                      {config.reportUrl ? (
                        <a className="text-link" href={config.reportUrl}>
                          Report an error / brand reply
                        </a>
                      ) : (
                        <span className="muted">Report link added with the public repo</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="small muted" style={{ marginTop: 12 }}>
          Wording is always “doesn't match rule LC-x”. A mismatch is a label note, not a judgement of the brand.
        </p>
      </section>

      <section className="page-section" aria-labelledby="eng-title">
        <h2 id="eng-title">YouCam and Claude counts</h2>
        <p>
          Delete confirmations, units per profile and per try-on, median latency, scan repeatability (one consenting person,
          three scans) and Claude's eval counts are added to summary.json after the recording run. They are not in this build's
          summary, so none are shown.
        </p>
      </section>
    </>
  );
}

function FrameStrip() {
  if (!frameShots.length) {
    return (
      <section className="page-section" aria-labelledby="frame-title">
        <h2 id="frame-title">Frame screenshots</h2>
        <p className="panel-sunken">No frame screenshots in this build. They are committed under data/frame/ at the frame-frozen tag.</p>
      </section>
    );
  }
  return (
    <section className="page-section" aria-labelledby="frame-title">
      <h2 id="frame-title">Frame screenshots</h2>
      <div className="frame-strip">
        {frameShots.map((p, i) => (
          <figure key={p}>
            <a href={imageUrls[p]}>
              <img src={imageUrls[p]} alt={`Frame screenshot ${i + 1}: Flipkart results with the Oily Skin filter on`} loading="lazy" width={180} height={320} />
            </a>
            <figcaption>{p.split('/').pop()}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
