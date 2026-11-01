import { COPY, type CatalogProduct } from '@skinkey/contracts';
import { RULES } from '@skinkey/rules';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { config } from '../config';
import { call } from '../lib/api';
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
      <div className="page">
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

  return (
    <div className="page">
      <div className="page-head">
        <h1>{name ?? (lookupFailed ? 'A shared SkinKey result' : 'Loading the product…')}</h1>
        <p>
          Someone shared this result from SkinKey. It carries the product, the label, the rule ids and the ruleset; no readings
          and no photo.
        </p>
      </div>

      <article className="verdict page-section" style={{ maxWidth: 760 }}>
        <div className="verdict-head" data-label={result.label}>
          <p className="verdict-label">{result.label === 'MEDICINE' ? 'No verdict' : result.label}</p>
          <p className="verdict-sub">
            {result.label === 'MEDICINE' ? COPY.medicine('a gated ingredient') : SUBTITLE[result.label]}
          </p>
        </div>
        <div className="verdict-body">
          {rules.length > 0 ? (
            <ol>
              {rules.map(({ id, rule }, i) => (
                <li key={`${id}-${i}`} className="reason">
                  <span className="reason-index">{i + 1}</span>
                  <span className="reason-text">{rule ? rule.template.replace(/\{(\w+)\}/g, (_, k: string) => (k === 'ingredient' ? 'a listed ingredient' : 'its claim')) : `Rule ${id}`}</span>
                  <span className="reason-meta">
                    Rule <span className="rule-id">{id}</span>
                    {rule?.grade ? ` · grade ${rule.grade}` : ''} ·{' '}
                    <Link className="text-link" to="/rules">
                      Where this comes from
                    </Link>
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            result.label === 'FITS' && <p className="reason-text" style={{ padding: '16px 0' }}>{COPY.fitsNoFlags}</p>
          )}
          <p className="provenance">
            {scan ? `Readings dated ${scan}` : 'No reading date'} · rules {result.rulesetHash}
          </p>
        </div>
      </article>

      {result.label !== 'MEDICINE' && (
        <section className="page-section" aria-labelledby="where-title" style={{ maxWidth: 760 }}>
          <h2 id="where-title">Find it</h2>
          <p className="small muted">{COPY.betterMatchesHeader}</p>
          <ul style={{ marginTop: 8 }}>
            {links.map((l) => (
              <li key={l.store} className="candidate">
                <span>
                  <strong>{l.label}</strong>
                  <span className="small muted" style={{ display: 'block' }}>
                    {l.destination}
                    {l.tagged ? ' · commission link' : ''}
                  </span>
                </span>
                <a className="btn btn-secondary btn-sm" href={l.href} rel={l.tagged ? 'sponsored noopener' : 'noopener'}>
                  Open
                </a>
              </li>
            ))}
          </ul>
          {disclosure && <p className="small" style={{ marginTop: 12 }}>{disclosure}</p>}
        </section>
      )}

      <p className="page-section">
        <Link className="btn btn-primary" to="/check">
          Check another listing
        </Link>
      </p>
    </div>
  );
}
