import { COPY, type Concern } from '@skinkey/contracts';
import { bandFor, MEDICINE_TOKENS } from '@skinkey/rules';
import { useEffect, useState } from 'react';
import { call } from '../lib/api';
import { bundledRules, fromWorker, type RulesData } from '../lib/rules';
import { claimText, cosingUrl, describeTriggers, GRADE_LABEL, KIND_LABEL } from '../lib/rulesText';

const CONCERNS: Concern[] = ['oiliness', 'moisture', 'redness', 'pore'];
const SAMPLE_SCORES = [20, 55, 85];
const KIND_ORDER = ['FIT_CAUTION', 'FIT_SUPPORT', 'LABEL_CHECK', 'MEDICINE'] as const;

function useRulesData() {
  const [data, setData] = useState<RulesData | null>(() => bundledRules());
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (data) return;
    const ctrl = new AbortController();
    call('rules', { signal: ctrl.signal })
      .then((r) => setData(fromWorker(r)))
      .catch((e: Error) => e.name !== 'AbortError' && setError(e.message));
    return () => ctrl.abort();
  }, [data]);
  return { data, error };
}

const safeBand = (score: number, concern: Concern, cutoffs: RulesData['bandCutoffs']) => {
  try {
    return bandFor(score, concern, cutoffs);
  } catch {
    return '?';
  }
};

export function Rules() {
  const { data, error } = useRulesData();
  return (
    <div className="page">
      <div className="page-head">
        <h1>The rules that make every call.</h1>
        <p>
          Every verdict in SkinKey comes from these rules, applied the same way to every product. Claude reads labels and
          titles; it never decides. Reasons are set templates filled with a rule, a reading band and an ingredient name.
        </p>
        <p className="banner">
          {COPY.rulesBanner} No rule here has measured evidence that it changes how skin looks for a given reading. Grades
          describe the evidence for the ingredient side only.
        </p>
      </div>
      {!data && !error && <p className="page-section muted">Loading the rule set…</p>}
      {!data && error && (
        <p className="page-section error-line">
          The rule set isn't bundled in this build and the Worker couldn't be reached ({error}).
        </p>
      )}
      {data && <RulesBody data={data} />}
    </div>
  );
}

function RulesBody({ data }: { data: RulesData }) {
  const sorted = [...data.rules].sort((a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind));
  return (
    <>
      <p className="small muted" style={{ marginTop: 20 }}>
        Ruleset hash <span className="rule-id">{data.hash ?? 'not computed'}</span> · {data.rules.length} rules · source:{' '}
        {data.source === 'package' ? 'rules package, bundled at build time' : 'GET /v1/rules'}
      </p>

      <section className="page-section" aria-labelledby="grades-title">
        <h2 id="grades-title">Grades</h2>
        <ul className="stack">
          <li>
            <strong>R</strong>: the ingredient's identity comes from a regulatory list, for example EU fragrance-allergen
            labelling (Reg. 2023/1545).
          </li>
          <li>
            <strong>L</strong>: literature, possibly contested. The counter-citation is listed with the rule.
          </li>
          <li>
            <strong>T</strong>: a team rule.
          </li>
        </ul>
        <p style={{ marginTop: 12 }}>
          Verdict order: a medicine token stops everything (MEDICINE). No verified or confirmed ingredient list gives UNKNOWN.
          Any caution rule firing gives CAUTION, reasons ordered R, then L, then T. Otherwise FITS. Label Check results are
          shown as an extra reason and never change the label on their own.
        </p>
      </section>

      <section className="page-section" aria-labelledby="list-title">
        <h2 id="list-title">Every rule</h2>
        <div className="table-scroll">
          <table className="data">
            <thead>
              <tr>
                <th scope="col">Rule</th>
                <th scope="col">Fires when</th>
                <th scope="col">Ingredients (CosIng)</th>
                <th scope="col">Reason template</th>
                <th scope="col">Sources</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => (
                <tr key={r.ruleId}>
                  <th scope="row">
                    <span className="rule-id">{r.ruleId}</span>
                    <div className="small muted">
                      {KIND_LABEL[r.kind]}
                      {r.grade ? ` · ${GRADE_LABEL[r.grade]}` : ''}
                    </div>
                    {r.counted === false && <div className="small muted">Informational, not counted</div>}
                    {r.contested && <div className="small muted">Contested definition</div>}
                  </th>
                  <td>
                    {describeTriggers(r)}
                    {r.positionLimit ? <div className="small muted">Only in the first {r.positionLimit} ingredients</div> : null}
                  </td>
                  <td>
                    <span className="small">
                      {r.inciSet.names.map((n, i) => (
                        <span key={n}>
                          <a className="text-link" href={cosingUrl(n)}>
                            {n}
                          </a>
                          {i < r.inciSet.names.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </span>
                    {r.inciSet.patterns.length > 0 && (
                      <div className="small muted">Families: {r.inciSet.patterns.map((p) => p.replace(/^\^|\$$/g, '')).join(' · ')}</div>
                    )}
                    {r.inciSet.excludes.length > 0 && (
                      <div className="small muted">Excludes: {r.inciSet.excludes.map((p) => p.replace(/^\^|\$$/g, '')).join(' · ')}</div>
                    )}
                  </td>
                  <td className="small">{r.template}</td>
                  <td className="small">
                    {r.sources.map((s) => (
                      <div key={s.citation}>{s.url ? <a className="text-link" href={s.url}>{s.citation}</a> : s.citation}</div>
                    ))}
                    {r.counterSources.length > 0 && (
                      <div className="muted" style={{ marginTop: 6 }}>
                        Counter:{' '}
                        {r.counterSources.map((s) => (
                          <span key={s.citation}>{s.url ? <a className="text-link" href={s.url}>{s.citation}</a> : s.citation} </span>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="page-section" aria-labelledby="medicine-title">
        <h2 id="medicine-title">Medicine gate</h2>
        <p>
          If an ingredient list or a title contains one of these, SkinKey shows no verdict and no better matches: “
          {COPY.medicine('[token]')}”
        </p>
        <p className="small" style={{ marginTop: 12 }}>
          {MEDICINE_TOKENS.join(', ') || 'Token list not in this build.'}
        </p>
      </section>

      <section className="page-section" aria-labelledby="bands-title">
        <h2 id="bands-title">Band cutoffs</h2>
        <p>
          Bands come from YouCam's raw_score only, never ui_score. Low below {data.bandCutoffs.lowBelow}, High from{' '}
          {data.bandCutoffs.highFrom}, Medium between. Which way a score runs is set per concern from gate G1. These cutoffs
          were frozen before the audit ran and are not tuned to the result.
        </p>
        <div className="table-scroll">
          <table className="data">
            <thead>
              <tr>
                <th scope="col">Concern</th>
                <th scope="col">Direction</th>
                {SAMPLE_SCORES.map((s) => (
                  <th key={s} scope="col">
                    raw_score {s}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CONCERNS.map((c) => (
                <tr key={c}>
                  <th scope="row">{c[0]!.toUpperCase() + c.slice(1)}</th>
                  <td>{data.bandCutoffs.direction[c] === 'higher_is_less_visible' ? 'Higher score, less visible' : 'Higher score, more visible'}</td>
                  {SAMPLE_SCORES.map((s) => (
                    <td key={s}>{safeBand(s, c, data.bandCutoffs)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="small muted" style={{ marginTop: 12 }}>
          {COPY.accuracyNote}
        </p>
      </section>

      <section className="page-section" aria-labelledby="profiles-title">
        <h2 id="profiles-title">The six reading profiles</h2>
        <p>Set band vectors used by the audit's “six readings” count and its claim-to-profile mapping. Zone labels apply only when gate G1 passes.</p>
        <div className="table-scroll">
          <table className="data">
            <thead>
              <tr>
                <th scope="col">Profile</th>
                {CONCERNS.map((c) => (
                  <th key={c} scope="col">
                    {c[0]!.toUpperCase() + c.slice(1)}
                  </th>
                ))}
                <th scope="col">Zones</th>
              </tr>
            </thead>
            <tbody>
              {data.profiles.map((p) => (
                <tr key={p.id}>
                  <th scope="row">{p.label}</th>
                  {CONCERNS.map((c) => (
                    <td key={c}>{p.bands[c]}</td>
                  ))}
                  <td className="small">
                    {Object.entries(p.zones)
                      .map(([z, v]) => `${z.replace('_', '-')}: ${v}`)
                      .join(' · ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="page-section" aria-labelledby="facet-title">
        <h2 id="facet-title">YouCam class to Flipkart filter</h2>
        <p>
          Used only for the secondary link to Flipkart's own filter, which is seller-tagged and not checked by SkinKey. Our own
          ranked list always comes first.
        </p>
        <div className="table-scroll">
          <table className="data">
            <thead>
              <tr>
                <th scope="col">YouCam class</th>
                <th scope="col">Flipkart filter</th>
              </tr>
            </thead>
            <tbody>
              {data.facetMap.map((f) => (
                <tr key={f.youcamClass}>
                  <th scope="row">{f.youcamClass}</th>
                  <td>{f.flipkartFacet ?? 'Keyword search only (no matching filter value)'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="page-section" aria-labelledby="claims-title">
        <h2 id="claims-title">Claims we read</h2>
        <p>
          Claim spans are found offline and ticked by a person. Matching a claim against the ingredient list is deterministic.
          Claim types:{' '}
          {[...new Set(data.rules.flatMap((r) => r.triggers.flatMap((t) => (t.on === 'claim' ? [claimText(t.claim)] : []))))].join(', ') ||
            'none in this rule set'}
          .
        </p>
      </section>
    </>
  );
}
