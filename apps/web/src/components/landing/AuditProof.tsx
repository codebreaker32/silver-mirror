import { COPY } from '@skinkey/contracts';
import { resultsCsv, summaryJson } from 'virtual:skinkey-audit';
import { Link } from 'react-router';
import { loadAudit } from '../../lib/audit';
import { Icon } from '../Icon';

/**
 * The audit, in two figures, rendered only from audit/summary.json (method brand-claims-1). No number here is typed
 * by hand: with no summary in the build the section says so instead.
 */
export function AuditProof() {
  const state = loadAudit(summaryJson, resultsCsv);
  if (state.kind !== 'ready')
    return (
      <section className="audit-proof" aria-labelledby="audit-proof-title">
        <div className="wrap" data-reveal>
          <h2 id="audit-proof-title">Brand pages, held up to their own ingredients.</h2>
          <p>
            The audit hasn't run in this build, so there are no counts to show. The method and the rules are{' '}
            <Link className="text-link" to="/audit">
              published first
            </Link>
            .
          </p>
        </div>
      </section>
    );
  const s = state.summary;
  const { b, e } = s.claim_profile;
  const checked = s.population.checked;
  return (
    <section className="audit-proof" aria-labelledby="audit-proof-title">
      <div className="wrap">
        <div className="audit-head" data-reveal>
          <h2 id="audit-proof-title">Brand pages, held up to their own ingredients.</h2>
          <p>
            Brands write “for oily skin” or “fragrance-free” on their own product pages. We froze the method and the rules in
            git, then ran every claim in our brand-page catalogue against the ingredient list on the same page.
          </p>
        </div>
        <div className="audit-figures">
          <figure data-reveal>
            <p className="figure-big">
              {e} <span>of</span> {b}
            </p>
            <figcaption>{s.text.claim_profile}</figcaption>
          </figure>
          <figure data-reveal>
            <p className="figure-big">
              {s.label_check.c} <span>of</span> {checked}
            </p>
            <figcaption>{s.text.label_check}</figcaption>
          </figure>
        </div>
        <div className="audit-foot" data-reveal>
          <p>
            {s.review.ticked === 0
              ? `A person has reviewed none of the ${s.review.items} flagged rows yet; all ${s.review.pending} are pending and listed for review.`
              : `A person has reviewed ${s.review.ticked} of the ${s.review.items} flagged rows; ${s.review.pending} are pending.`}{' '}
            {s.headline ? `Ruleset ${s.ruleset_hash}, matching the frozen record.` : 'This run is outside the frozen rules, so it is not the headline.'}
          </p>
          <p className="caption">{COPY.auditCaption}</p>
          <Link className="btn btn-secondary" to="/audit">
            Read the audit
            <Icon name="arrow-right" />
          </Link>
        </div>
      </div>
    </section>
  );
}

