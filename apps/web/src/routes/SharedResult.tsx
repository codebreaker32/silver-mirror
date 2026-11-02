import { COPY, type CatalogProduct } from '@skinkey/contracts';
import { RULES } from '@skinkey/rules';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { config } from '../config';
import { call } from '../lib/api';
import { Icon } from '../components/Icon';
import { Ledger, ReasonList, VerdictHead, limitsRow } from '../components/VerdictCard';
import { decodeSharedResult } from '../lib/share';
import { disclosureFor, storeLinks } from '../lib/storeLinks';

const SUBTITLE: Record<string, string | undefined> = COPY.subtitle;

export function SharedResult() {
  const { token = '' } = useParams();
  const result = decodeSharedResult(token);
  const [product, setProduct] = useState<CatalogProduct | null>(null);
  const [lookupFailed, setLookupFailed] = useState(false);

  useEffect(() => {
    if (!result) return;
    const ctrl = new AbortController();
    call('catalogProduct', { params: { id: result.productId }, signal: ctrl.signal })
      .then((r) => setProduct(r.product))
      .catch((e: Error) => e.name !== 'AbortError' && setLookupFailed(true));
    return () => ctrl.abort();
  }, [result?.productId]);

  if (!result)
    return (
      <div className="page page-narrow">
        <div className="page-head">
          <h1>This result link can't be read.</h1>
          <p>
            It may have been cut off when it was copied. Check the product again on the{' '}
            <Link className="text-link" to="/check">
              web check
            </Link>
            .
          </p>
        </div>
      </div>
    );

  const name = product ? [product.brand, product.name, product.size].filter(Boolean).join(' · ') : null;
  const links = storeLinks(product ? `${product.brand} ${product.name}` : result.productId.replace(/-/g, ' '), config.affiliate);
  const disclosure = disclosureFor(links);
  const rules = result.ruleIds.map((id) => ({ id, rule: RULES.find((r) => r.ruleId === id) }));
  const scan = result.scanDate ? new Date(result.scanDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : null;
  const reasons = rules.map(({ id, rule }, i) => ({
    key: `${id}-${i}`,
    reading: null,
    fact: rule ? rule.template.replace(/\{(\w+)\}/g, (_, k: string) => (k === 'ingredient' ? 'a listed ingredient' : 'its claim')) : `Rule ${id}`,
    tag: (
      <>
        Rule <span className="rule-id">{id}</span>
        {rule?.grade ? ` · grade ${rule.grade}` : ''} ·{' '}
        <Link className="text-link" to="/rules">
          Where this comes from
        </Link>
      </>
    ),
  }));

  return (
    <div className="page page-narrow">
      <header className="page-head">
        <h1>{name ?? (lookupFailed ? `A shared ${COPY.appName} result` : 'Loading the product…')}</h1>
        <p>
          Someone shared this result from {COPY.appName}. It carries the product, the label, the rule ids and the ruleset; no
          readings and no photo.
        </p>
      </header>

      <article className="verdict page-section">
        <VerdictHead
          label={result.label}
          line={result.label === 'MEDICINE' ? COPY.medicine('a gated ingredient') : (SUBTITLE[result.label] ?? '')}
        />
        {result.label !== 'MEDICINE' &&
          (reasons.length > 0 ? <ReasonList reasons={reasons} /> : result.label === 'FITS' && <p className="reason-none">{COPY.fitsNoFlags}</p>)}
        <Ledger
          rows={[
            { key: 'Reading', value: scan ? `Readings dated ${scan}` : 'No reading date', sub: 'The readings themselves are not in the link' },
            { key: 'Rules', value: `Published rules (version ${result.rulesetHash.slice(0, 7)})`, links: [{ label: 'Every rule', href: '/rules', internal: true }] },
            limitsRow,
          ]}
        />
      </article>

      {result.label !== 'MEDICINE' && (
        <section className="page-section" aria-labelledby="where-title">
          <h2 id="where-title" className="section-head">
            Find it
          </h2>
          <p className="honesty-line">{COPY.betterMatchesHeader}</p>
          <ul className="match-list">
            {links.map((l) => (
              <li key={l.store} className="match">
                <span className="match-text">
                  <span className="match-name">{l.label}</span>
                  <span className="caption">
                    {l.destination}
                    {l.tagged ? ' · commission link' : ''}
                  </span>
                </span>
                <a className="btn btn-secondary btn-sm" href={l.href} rel={l.tagged ? 'sponsored noopener' : 'noopener'} aria-label={`Open: ${l.label}`}>
                  Open
                  <Icon name="arrow-up-right" size={16} />
                </a>
              </li>
            ))}
          </ul>
          {disclosure && <p className="caption">{disclosure}</p>}
        </section>
      )}

      <p className="page-section">
        <Link className="btn btn-primary" to="/check">
          Check another listing
          <Icon name="arrow-right" />
        </Link>
      </p>
    </div>
  );
}
