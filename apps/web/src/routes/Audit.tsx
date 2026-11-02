import { COPY } from '@skinkey/contracts';
import { auditFiles, gitTags, resultsCsv, summaryJson } from 'virtual:skinkey-audit';
import { Link } from 'react-router';
import { config } from '../config';
import {
  claimReviewItems,
  distinctQuotes,
  freeFromRows,
  heatStep,
  labelCheckSentence,
  labelReviewItems,
  loadAudit,
  profileClaimRows,
  type AuditSummary,
  type ReviewItem,
} from '../lib/audit';

const METHOD = [
  {
    tag: 'audit-method-frozen',
    title: 'Method',
    body: "Written down before anything ran: which rows count, how claims are read from the brand's own page, which reading profiles each claim points to, and the sentences the numbers go into.",
  },
  {
    tag: 'rules-frozen',
    title: 'Rules',
    body: 'The rules, reading profiles and band cutoffs are frozen with their ruleset hash and a SHA-256 of every rules file. A run whose ruleset hash differs is not the headline.',
  },
  {
    tag: 'audit-run',
    title: 'Run',
    body: 'npm run audit reads only the brand-page rows in data/catalog and writes results.csv, summary.json and the review list. This page renders only from those files, copied in at build time.',
  },
];

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }) + ' UTC';
};

const PROFILE_ORDER = (s: AuditSummary) => s.heatmap.map((h) => ({ id: h.profile_id, label: h.label }));

export function Audit() {
  const state = loadAudit(summaryJson, resultsCsv);
  return (
    <div className="page">
      <div className="page-head">
        <h1>What the brand page says, checked against its own ingredients</h1>
        <p>
          Brands write “for oily skin”, “non-comedogenic” or “fragrance-free” on their own product pages. This audit takes
          those claims and the ingredient list on the same page, and runs them through our published rules. It reads only
          brand pages already in our catalogue: no store page is read, scraped or screenshotted. Every number on this page
          comes from the audit script.
        </p>
        <p className="banner">{COPY.auditCaption}</p>
      </div>

      <section className="page-section" aria-labelledby="method-title">
        <h2 id="method-title">Method, frozen before the run</h2>
        <p>
          Each step is committed and tagged in git before the next one runs. If a count comes out small or zero, it is
          published anyway.
          {auditFiles['METHOD.md'] && (
            <>
              {' '}
              <a className="text-link" href={auditFiles['METHOD.md']}>
                Read the full method
              </a>
              .
            </>
          )}
        </p>
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
      {state.kind === 'ready' && <Results summary={state.summary} csvAvailable={state.csvAvailable} />}
    </div>
  );
}

function NotRun() {
  return (
    <section className="page-section" aria-labelledby="notrun-title">
      <h2 id="notrun-title">The audit hasn't run yet.</h2>
      <p>
        There is no audit/summary.json in this build, so there are no counts to show. Results appear here only after the
        method and the rules are frozen and npm run audit has run. We don't write headline numbers before the script does.
      </p>
      <p>
        Meanwhile, the <Link className="text-link" to="/rules">rules</Link> and the reading profiles they run against are
        public.
      </p>
    </section>
  );
}

function Results({ summary, csvAvailable }: { summary: AuditSummary; csvAvailable: boolean }) {
  const p = summary.population;
  const sentences = [summary.text.coverage, labelCheckSentence(summary), summary.text.claim_profile, summary.text.six_readings].filter(
    (t): t is string => !!t,
  );
  return (
    <>
      <section className="page-section" aria-labelledby="run-title">
        <h2 id="run-title">{!summary.headline ? 'Run outside the frozen rules, not the headline' : summary.pilot ? 'Pilot result' : 'Result'}</h2>
        <p className="small muted">
          Generated {fmtDate(summary.generated_at)} · method {summary.method} · ruleset{' '}
          <span className="rule-id">{summary.ruleset_hash}</span> (v{summary.ruleset_version}) · frozen record: {summary.frozen.status}
          {csvAvailable && auditFiles['results.csv'] && (
            <>
              {' · '}
              <a className="text-link" href={auditFiles['results.csv']} download>
                results.csv
              </a>
            </>
          )}
          {auditFiles['review.md'] && (
            <>
              {' · '}
              <a className="text-link" href={auditFiles['review.md']}>
                review list
              </a>
            </>
          )}
        </p>
        {!summary.headline && (
          <p className="banner">
            This run's ruleset doesn't match the frozen record ({summary.frozen.status}). Use it to see the method working,
            not as a finding.
          </p>
        )}
        {sentences.length > 0 && (
          <div className="stack" style={{ marginTop: 24, maxWidth: '64ch' }}>
            {sentences.map((t) => (
              <p key={t} className="audit-sentence">
                {t}
              </p>
            ))}
          </div>
        )}
        {summary.notes.length > 0 && (
          <ul className="stack small" style={{ marginTop: 16, listStyle: 'disc', paddingLeft: 20 }}>
            {summary.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="page-section" aria-labelledby="counts-title">
        <h2 id="counts-title">Coverage</h2>
        <div className="two-col">
          <div className="panel">
            <p className="count-big">
              {p.a} <span className="muted">of</span> {p.N}
            </p>
            <p style={{ marginTop: 8 }}>
              Products whose own brand page makes a skin-type or free-from claim (N), and how many of those pages give a
              complete ingredient list (a). {p.unverifiable} have no complete list there, so they count in N but are not
              checked.
            </p>
          </div>
          <div className="panel">
            <p className="count-big">{p.checked}</p>
            <p style={{ marginTop: 8 }}>
              Products run through the rules. From {summary.input.rows} catalogue rows in {summary.input.files} brand files,{' '}
              {p.brand_rows} are brand-page rows in scope; the rest were left out before any rule ran (
              {Object.entries(summary.excluded)
                .map(([k, v]) => `${k.replace(/_/g, ' ')} ${v}`)
                .join(', ') || 'none'}
              ).
              {p.medicine > 0 && ` ${p.medicine} stopped at the medicine gate.`}
            </p>
          </div>
        </div>
      </section>

      {p.checked === 0 ? (
        <NothingChecked />
      ) : (
        <>
          <LabelCheck summary={summary} />
          <ClaimProfile summary={summary} />
          <SixReadings summary={summary} />
          <ReviewList summary={summary} />
        </>
      )}

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

/** Zero products checked: show no tables and no "0 hits", since a table of zeros would read as a finding. */
function NothingChecked() {
  return (
    <section className="page-section" aria-labelledby="nothing-title">
      <h2 id="nothing-title">Nothing checked yet</h2>
      <p className="panel-sunken">
        No product was run through the rules in this build, so there are no Label Check, claim or reading-profile counts.
        Zero here means “not measured”, not “nothing found”.
      </p>
    </section>
  );
}

function LabelCheck({ summary }: { summary: AuditSummary }) {
  const items = labelReviewItems(summary);
  const testable = freeFromRows(summary);
  const tested = testable.reduce((n, m) => n + m.checked, 0);
  return (
    <section className="page-section" aria-labelledby="lc-title">
      <h2 id="lc-title">Label Check</h2>
      {summary.label_check.c === 0 && summary.label_check.d === 0 ? (
        <p>{labelCheckSentence(summary)}</p>
      ) : (
        <p>
          <strong>{summary.label_check.c}</strong> of {summary.population.checked} make a claim their own ingredient list
          doesn't match (strict rules LC-1a, LC-2, LC-3). <strong>{summary.label_check.d}</strong> more list a fragrance
          substance or essential oil under a “fragrance-free” claim (LC-1b, informational).
        </p>
      )}
      <p className="small muted" style={{ marginTop: 8 }}>
        Only free-from claims can be tested this way. Checked products with each one:{' '}
        {testable.map((m) => `${m.label} ${m.checked}`).join(', ')}.
      </p>
      {items.length === 0 ? (
        <p className="panel-sunken" style={{ marginTop: 16 }}>
          No free-from claim in this run is contradicted by its own ingredient list under LC-1a, LC-1b, LC-2 or LC-3. That is
          the result, published as computed. It rests on {tested} free-from claims, so it says little about claims we
          didn't see.
        </p>
      ) : (
        <ReviewTable items={items} caption="Label Check hits" />
      )}
      <p className="small muted" style={{ marginTop: 12 }}>
        Wording is always “doesn't match rule LC-x”. A mismatch is a label note, not a judgement of the brand.
      </p>
    </section>
  );
}

function ClaimProfile({ summary }: { summary: AuditSummary }) {
  const rows = profileClaimRows(summary);
  const profiles = PROFILE_ORDER(summary);
  return (
    <section className="page-section" aria-labelledby="cp-title">
      <h2 id="cp-title">The claim, and the reading it points to</h2>
      <p>
        <strong>{summary.claim_profile.e}</strong> of {summary.claim_profile.b} products that name a skin type or
        “non-comedogenic” on their brand page are flagged CAUTION by our rules for a reading profile their own claim points
        to. “For oily skin” points to the Oily profiles, “for sensitive skin” to the profiles with high visible redness (a
        team mapping: sensitivity is not a YouCam reading), “for all skin types” to all six.
      </p>
      <div className="table-scroll">
        <table className="data">
          <caption className="visually-hidden">CAUTION counts per brand-page claim and reading profile</caption>
          <thead>
            <tr>
              <th scope="col">Brand page says</th>
              <th scope="col">Checked</th>
              {profiles.map((pr) => (
                <th key={pr.id} scope="col">
                  {pr.label}
                </th>
              ))}
              <th scope="col">Flagged for a profile the claim points to</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.claim}>
                <th scope="row">“{m.label}”</th>
                <td>{m.checked}</td>
                {profiles.map((pr) => {
                  const matched = m.profiles_matched.includes(pr.id);
                  return (
                    <td key={pr.id} className={`cell heat-${heatStep(m.caution[pr.id] ?? 0, m.checked)}`}>
                      {matched ? <strong>{m.caution[pr.id] ?? 0} †</strong> : (m.caution[pr.id] ?? 0)}
                      {matched && <span className="visually-hidden"> (a profile this claim points to)</span>}
                    </td>
                  );
                })}
                <td>
                  <strong>{m.claim_matched_caution ?? 'n/a'}</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="small muted" style={{ marginTop: 12 }}>
        † a reading profile the claim points to. Cells count products flagged CAUTION. {summary.text.caption}
      </p>
    </section>
  );
}

function SixReadings({ summary }: { summary: AuditSummary }) {
  const checked = summary.population.checked;
  return (
    <section className="page-section" aria-labelledby="heat-title">
      <h2 id="heat-title">Six readings</h2>
      <p>
        Products flagged CAUTION under each YouCam reading profile, out of {checked} checked, split by the grade of the
        strongest rule that fired (R regulatory list, L literature, T team rule). Profiles are defined on the{' '}
        <Link className="text-link" to="/rules">
          rules page
        </Link>
        .
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
  );
}

function ReviewList({ summary }: { summary: AuditSummary }) {
  const items = claimReviewItems(summary);
  const r = summary.review;
  return (
    <section className="page-section" aria-labelledby="review-title">
      <h2 id="review-title">Every flagged row, for review</h2>
      <p>
        {r.items} flagged rows on {r.products} products. A person has reviewed {r.ticked}; {r.pending} are pending. Each row
        names the claim quote, the ingredient and the rule, with the brand page to check them against.
      </p>
      {items.length === 0 ? (
        <p className="panel-sunken" style={{ marginTop: 16 }}>
          No product in this run is flagged for a reading profile its own claim points to.
        </p>
      ) : (
        <ReviewTable
          items={items}
          caption="Claims flagged for a reading profile they point to"
          profileLabels={Object.fromEntries(summary.heatmap.map((h) => [h.profile_id, h.label]))}
        />
      )}
    </section>
  );
}

function ReviewTable({ items, caption, profileLabels }: { items: ReviewItem[]; caption: string; profileLabels?: Record<string, string> }) {
  const showProfiles = !!profileLabels;
  return (
    <div className="table-scroll">
      <table className="data">
        <caption className="visually-hidden">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Product</th>
            <th scope="col">Rule</th>
            <th scope="col">Brand page says</th>
            <th scope="col">Ingredient list has</th>
            {showProfiles && <th scope="col">Reading profiles</th>}
            <th scope="col">Evidence</th>
          </tr>
        </thead>
        <tbody>
          {items.map((r) => (
            <tr key={`${r.catalog_id}|${r.rule_id}|${r.matched_token}`}>
              <th scope="row">
                {r.brand}: {r.product_name}
                <div className="small muted">review {r.review_status}</div>
              </th>
              <td>
                <span className="rule-id">{r.rule_id}</span>
                <div className="small muted">
                  grade {r.grade || 'n/a'}
                  {r.kind === 'LABEL_CHECK' && !r.counted ? ' · informational' : ''}
                  {r.contested ? ' · contested definition' : ''}
                </div>
              </td>
              <td>{r.claim_quote ? `“${distinctQuotes(r.claim_quote)}”` : r.claim_type}</td>
              <td>
                {r.matched_token}
                {r.position ? <span className="small muted"> (position {r.position})</span> : null}
              </td>
              {profileLabels && <td className="small">{r.profile_ids.map((id) => profileLabels[id] ?? id).join(', ')}</td>}
              <td className="small">
                {r.source_url && (
                  <a className="text-link" href={r.source_url} rel="noopener noreferrer">
                    Brand page
                  </a>
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
  );
}
