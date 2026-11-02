import {
  COPY,
  DEMO_KEY,
  type CatalogProduct,
  type HowThisWasMade,
  type InciToken,
  type KeyProfile,
  type RankedMatch,
  type ResolveCandidate,
  type ResolveResponse,
} from '@skinkey/contracts';
import { facetFor, rank, READING_PROFILES } from '@skinkey/rules';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router';
import { SAMPLE_SHARE } from '../../../../packages/contracts/src/proposals/web';
import { BandList } from '../components/BandList';
import { Icon } from '../components/Icon';
import { limitsRow, rulesRow, VerdictCard, type LedgerRow } from '../components/VerdictCard';
import { config } from '../config';
import { call, WORKER_URL, WorkerError } from '../lib/api';
import { fileToJpegBase64 } from '../lib/image';
import { profileKey, safeVerdict } from '../lib/rules';
import { encodeSharedResult } from '../lib/share';
import { flipkartFacetSearch } from '../lib/storeLinks';

type Chip = { id: number; value: string; uncertain: boolean };

type Stage =
  | { at: 'idle' }
  | { at: 'resolving' }
  | { at: 'confirm'; res: ResolveResponse }
  | { at: 'loading_product'; res: ResolveResponse }
  | { at: 'result'; res: ResolveResponse | null; product: CatalogProduct | null }
  | { at: 'error'; message: string };

const KEY_OPTIONS = [{ id: 'demo', label: COPY.reading.demo }, ...READING_PROFILES.map((p) => ({ id: p.id, label: p.label }))];

const keyFor = (id: string): KeyProfile => {
  const p = READING_PROFILES.find((x) => x.id === id);
  return p ? profileKey(p) : DEMO_KEY;
};

const errorText = (e: unknown) =>
  e instanceof WorkerError
    ? e.status === 0
      ? `The Silver Mirror Worker isn't reachable from this page (${WORKER_URL}).`
      : e.message
    : 'Something went wrong. Try again.';

const productLine = (p: { brand: string; name: string; size?: string | undefined }) => [p.brand, p.name, p.size].filter(Boolean).join(' · ');

export function Check() {
  const [params] = useSearchParams();
  const [text, setText] = useState('');
  const [source, setSource] = useState<'paste' | 'sample'>('paste');
  const [keyId, setKeyId] = useState('demo');
  const [stage, setStage] = useState<Stage>({ at: 'idle' });
  const [chips, setChips] = useState<Chip[] | null>(null);
  const [ledgers, setLedgers] = useState<HowThisWasMade[]>([]);
  const autoRan = useRef(false);
  const key = useMemo(() => keyFor(keyId), [keyId]);

  const resolve = async (body: { source: 'paste' | 'sample'; text: string }) => {
    setStage({ at: 'resolving' });
    setChips(null);
    setLedgers([]);
    try {
      const isUrl = /^https?:\/\//i.test(body.text.trim());
      const res = await call('resolve', { body: isUrl ? { source: body.source, url: body.text.trim() } : body });
      setLedgers([res.ledger]);
      if (res.outcome === 'match' || res.outcome === 'candidates') setStage({ at: 'confirm', res });
      else setStage({ at: 'result', res, product: null });
    } catch (e) {
      setStage({ at: 'error', message: errorText(e) });
    }
  };

  const runSample = () => {
    setText(SAMPLE_SHARE.text);
    setSource('sample');
    void resolve({ source: 'sample', text: SAMPLE_SHARE.text });
  };

  useEffect(() => {
    if (params.get('sample') === '1' && !autoRan.current) {
      autoRan.current = true;
      runSample();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    void resolve({ source, text: text.trim() });
  };

  const confirm = async (res: ResolveResponse, c: ResolveCandidate) => {
    setStage({ at: 'loading_product', res });
    try {
      const { product } = await call('catalogProduct', { params: { id: c.catalogId } });
      setStage({ at: 'result', res, product });
    } catch (e) {
      setStage({ at: 'error', message: errorText(e) });
    }
  };

  const busy = stage.at === 'resolving';
  return (
    <div className="page page-check">
      <header className="page-head">
        <h1>Check a listing</h1>
        <p>
          Paste a Flipkart, Amazon.in or Nykaa link, or the product title. The web check uses labelled sample readings, so you
          can see the whole flow without a phone or a scan.
        </p>
      </header>

      <div className="check-grid">
        <div className="check-main">
          <form className="paste" onSubmit={onSubmit}>
            <label className="field-label" htmlFor="listing">
              Link or product title
            </label>
            <div className="paste-field has-action">
              <input
                id="listing"
                value={text}
                placeholder="https://www.flipkart.com/… or a product name"
                autoComplete="off"
                spellCheck={false}
                onChange={(e) => {
                  setText(e.target.value);
                  setSource('paste');
                }}
              />
              <button className="btn btn-primary btn-inline" type="submit" disabled={!text.trim() || busy} aria-label={busy ? 'Checking' : 'Check this listing'}>
                {busy ? 'Checking…' : 'Check'}
              </button>
            </div>
            <div className="paste-after">
              <button className="btn btn-secondary" type="button" onClick={runSample} disabled={busy}>
                Try a sample share
              </button>
              {source === 'sample' && <p className="caption">{SAMPLE_SHARE.label}</p>}
            </div>
          </form>

          <div className="check-flow">
            {stage.at === 'resolving' && <StatusLine text="Reading the listing…" />}
            {stage.at === 'error' && <p className="error-line">{stage.message}</p>}
            {stage.at === 'confirm' && <Confirm res={stage.res} onYes={(c) => void confirm(stage.res, c)} onNo={() => setStage({ at: 'result', res: stage.res, product: null })} />}
            {stage.at === 'loading_product' && <StatusLine text="Loading the product…" />}
            {stage.at === 'result' && (
              <Result
                res={stage.res}
                product={stage.product}
                keyId={keyId}
                keyProfile={key}
                chips={chips}
                setChips={setChips}
                onLedger={(l) => setLedgers((xs) => [...xs, l])}
              />
            )}
            {ledgers.length > 0 && <HowMade ledgers={ledgers} />}
          </div>
        </div>

        <KeyPanel keyId={keyId} setKeyId={setKeyId} keyProfile={key} />
      </div>
    </div>
  );
}

function StatusLine({ text }: { text: string }) {
  return (
    <p className="status-line" role="status">
      <Icon name="circle-dot" />
      {text}
    </p>
  );
}

function KeyPanel({ keyId, setKeyId, keyProfile }: { keyId: string; setKeyId: (id: string) => void; keyProfile: KeyProfile }) {
  return (
    <aside className="card reading-panel" aria-labelledby="reading-panel-title">
      <div className="reading-panel-head">
        <span className="icon-disc">
          <Icon name="droplet" />
        </span>
        <div>
          <h2 id="reading-panel-title" className="section-head">
            {COPY.reading.yours}
          </h2>
          <p className="caption">Sample readings, labelled. Not a scan of anyone.</p>
        </div>
      </div>
      <label className="field-label" htmlFor="key-select">
        Readings used for this check
      </label>
      <div className="select-wrap">
        <select id="key-select" className="select" value={keyId} onChange={(e) => setKeyId(e.target.value)}>
          {KEY_OPTIONS.map((o) => (
            <option key={o.id} value={o.id}>
              {o.id === 'demo' ? `${COPY.reading.demo} (sample readings)` : `Reading profile: ${o.label}`}
            </option>
          ))}
        </select>
      </div>
      <BandList bands={keyProfile.bands} />
      <p className="caption">Your own reading is made in the Android app and stays on your phone. {COPY.accuracyNote}</p>
    </aside>
  );
}

function Confirm({ res, onYes, onNo }: { res: ResolveResponse; onYes: (c: ResolveCandidate) => void; onNo: () => void }) {
  const [top, ...rest] = res.candidates;
  if (!top) return null;
  if (res.outcome === 'match')
    return (
      <section className="card confirm" aria-labelledby="confirm-title">
        <h2 id="confirm-title" className="section-head">
          {COPY.productKicker}
        </h2>
        <p className="confirm-name">
          We think this is <strong>{productLine(top.product)}</strong>.
        </p>
        <div className="btn-pair">
          <button className="btn btn-primary" type="button" onClick={() => onYes(top)}>
            Yes
          </button>
          <button className="btn btn-secondary" type="button" onClick={onNo}>
            Not this
          </button>
        </div>
        <p className="caption">No verdict appears before you confirm the product.</p>
      </section>
    );
  return (
    <section className="card confirm" aria-labelledby="confirm-title">
      <h2 id="confirm-title" className="section-head">
        {COPY.skuChoose}
      </h2>
      <ul className="candidates">
        {[top, ...rest].map((c) => (
          <li key={c.catalogId}>
            <button className="candidate" type="button" onClick={() => onYes(c)}>
              <span className="thumb">
                <Icon name="droplet" size={24} />
              </span>
              <span className="candidate-name">{productLine(c.product)}</span>
              <Icon name="chevron-right" />
            </button>
          </li>
        ))}
      </ul>
      <button className="btn btn-secondary btn-block" type="button" onClick={onNo}>
        None of these
      </button>
      <p className="caption">We check nothing until you pick.</p>
    </section>
  );
}

function readingRow(keyId: string): LedgerRow {
  const profile = READING_PROFILES.find((p) => p.id === keyId);
  return profile
    ? { key: 'Reading', value: `Reading profile: ${profile.label}, a set band combination, not a scan`, sub: 'No photo taken' }
    : { key: 'Reading', value: `${COPY.reading.demo}: labelled sample readings, not a scan`, sub: 'No photo taken' };
}

function productRow(inciSource: string | null, product: CatalogProduct | null, labelCount: number, catalogCount: number | null): LedgerRow {
  if (inciSource === 'catalog_verified') {
    const by = product?.verified_by;
    return {
      key: 'Product',
      value: COPY.catalogSource,
      sub: by === 'human' ? COPY.catalogHumanChecked : by === 'brand_page_check' ? COPY.catalogBrandPageChecked : 'Copied from the brand page',
      links: product?.source_url ? [{ label: 'Ingredient list source', href: product.source_url }] : [],
    };
  }
  if (inciSource === 'label_photo_confirmed') return { key: 'Product', value: COPY.labelPhotoProvenance, sub: `${labelCount} ingredients` };
  return { key: 'Product', value: 'Product name only', sub: catalogCount != null ? COPY.catalogCount(catalogCount) : null };
}

function Result({
  res,
  product,
  keyId,
  keyProfile,
  chips,
  setChips,
  onLedger,
}: {
  res: ResolveResponse | null;
  product: CatalogProduct | null;
  keyId: string;
  keyProfile: KeyProfile;
  chips: Chip[] | null;
  setChips: (c: Chip[] | null) => void;
  onLedger: (l: HowThisWasMade) => void;
}) {
  const [confirmed, setConfirmed] = useState<InciToken[] | null>(null);
  useEffect(() => setConfirmed(null), [product]);

  const verifiedInci = product && product.verified && product.status === 'verified' && product.inci.length ? product.inci : null;
  const inci = confirmed ?? verifiedInci;
  const inciSource = confirmed ? 'label_photo_confirmed' : verifiedInci ? 'catalog_verified' : null;
  const v = safeVerdict({
    key: keyProfile,
    inci,
    inciSource,
    inciSourceUrl: confirmed ? undefined : product?.source_url,
    claims: product?.claims ?? [],
    title: product?.name ?? res?.extractedTitle ?? undefined,
  });

  if (res?.outcome === 'not_skincare' && !product)
    return (
      <section className="card">
        <h2 className="section-head">This doesn't look like a skincare listing.</h2>
        <p>{COPY.appName} checks face skincare: moisturisers, sunscreens, cleansers, serums and tints.</p>
      </section>
    );
  if (!v) return <p className="error-line">The rules package couldn't run in this build.</p>;

  const shareToken =
    product && v.label !== 'UNKNOWN'
      ? encodeSharedResult({
          v: 1,
          productId: product.id,
          label: v.label,
          ruleIds: [...v.reasons, ...v.labelChecks].map((r) => r.ruleId),
          scanDate: keyProfile.scanDate,
          rulesetHash: v.provenance.rulesetHash,
        })
      : null;
  const ledger: LedgerRow[] = [
    readingRow(keyId),
    productRow(inciSource, product, confirmed?.length ?? 0, res?.catalogCount ?? null),
    rulesRow(v),
    limitsRow,
  ];
  const title = product ? `${product.brand} ${product.name}` : (res?.extractedTitle ?? null);

  return (
    <div className="result">
      {title && (
        <header className="product-header">
          <h2 className="product-title">{title}</h2>
          {product?.size && <p className="caption">{product.size}</p>}
        </header>
      )}
      <VerdictCard verdict={v} note={'note' in v ? v.note : undefined} ledger={ledger} demo={keyId === 'demo'} />
      {v.label === 'UNKNOWN' && !confirmed && (
        <LabelPhoto catalogCount={res?.catalogCount ?? null} chips={chips} setChips={setChips} onLedger={onLedger} onConfirm={setConfirmed} />
      )}
      {v.label !== 'MEDICINE' && <BetterMatches product={product} keyProfile={keyProfile} />}
      {shareToken && (
        <p className="share-line">
          <Link className="text-link" to={`/r/${shareToken}`}>
            Open a shareable result page
          </Link>{' '}
          <span className="caption">(product, label, rule ids and ruleset hash only; no readings, no photo)</span>
        </p>
      )}
    </div>
  );
}

function LabelPhoto({
  catalogCount,
  chips,
  setChips,
  onLedger,
  onConfirm,
}: {
  catalogCount: number | null;
  chips: Chip[] | null;
  setChips: (c: Chip[] | null) => void;
  onLedger: (l: HowThisWasMade) => void;
  onConfirm: (inci: InciToken[]) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadable, setUnreadable] = useState(0);
  const nextId = useRef(1);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const imageBase64 = await fileToJpegBase64(file);
      const res = await call('labelOcr', { body: { imageBase64, mediaType: 'image/jpeg' } });
      onLedger(res.ledger);
      setUnreadable(res.unreadableRegions);
      setChips(res.tokens.map((t) => ({ id: nextId.current++, value: t.cosingName ?? t.raw, uncertain: t.uncertain })));
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  };

  const update = (id: number, value: string) => setChips((chips ?? []).map((c) => (c.id === id ? { ...c, value, uncertain: false } : c)));
  const remove = (id: number) => setChips((chips ?? []).filter((c) => c.id !== id));

  return (
    <section className="card label-photo" aria-labelledby="label-photo-title">
      <h2 id="label-photo-title" className="section-head">
        Next step
      </h2>
      {catalogCount != null && <p className="caption">{COPY.catalogCount(catalogCount)}</p>}
      {!chips ? (
        <>
          <label className="btn btn-primary btn-file">
            <Icon name="camera" />
            {busy ? 'Reading the label…' : COPY.snapLabel.replace(/\.$/, '')}
            <input type="file" accept="image/*" capture="environment" className="visually-hidden" disabled={busy} onChange={(e) => void onFile(e.target.files?.[0])} />
          </label>
          <p className="caption">
            A photo of the ingredient list only. Claude reads it into ingredient names; you check them before any rule runs.
            The photo is not stored.
          </p>
        </>
      ) : (
        <>
          <p className="body-strong">Check the ingredient names</p>
          <p className="caption">
            Dashed names were hard to read. Edit or remove any name, then run the rules.
            {unreadable > 0 && ` ${unreadable} part${unreadable === 1 ? '' : 's'} of the photo couldn't be read.`}
          </p>
          <div className="chips">
            {chips.map((c) => (
              <span key={c.id} className="chip-edit" data-uncertain={c.uncertain}>
                <input aria-label="Ingredient name" value={c.value} size={Math.max(4, c.value.length)} onChange={(e) => update(c.id, e.target.value)} />
                <button type="button" aria-label={`Remove ${c.value}`} onClick={() => remove(c.id)}>
                  <Icon name="close" size={16} />
                </button>
              </span>
            ))}
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setChips([...chips, { id: nextId.current++, value: '', uncertain: false }])}
            >
              Add a name
            </button>
          </div>
          <div className="btn-pair">
            <button
              type="button"
              className="btn btn-primary"
              disabled={!chips.some((c) => c.value.trim())}
              onClick={() =>
                onConfirm(
                  chips
                    .map((c) => c.value.trim())
                    .filter(Boolean)
                    .map((token, i) => ({ token, position: i + 1 })),
                )
              }
            >
              These are right, run the rules
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setChips(null)}>
              Retake
            </button>
          </div>
        </>
      )}
      {error && <p className="error-line">{error}</p>}
    </section>
  );
}

function BetterMatches({ product, keyProfile }: { product: CatalogProduct | null; keyProfile: KeyProfile }) {
  const [matches, setMatches] = useState<{ m: RankedMatch; p: CatalogProduct }[] | null>(null);
  const category = product?.category;

  useEffect(() => {
    if (!category) return;
    const ctrl = new AbortController();
    (async () => {
      const { results } = await call('catalogSearch', { query: { category, limit: '12' }, signal: ctrl.signal });
      const products = (
        await Promise.all(
          results.filter((r) => r.verified).map((r) => call('catalogProduct', { params: { id: r.id }, signal: ctrl.signal }).then((x) => x.product)),
        )
      ).filter(Boolean);
      const ranked = rank(products, keyProfile, { limit: 3, excludeId: product?.id });
      setMatches(ranked.flatMap((m) => products.filter((p) => p.id === m.productId).map((p) => ({ m, p }))));
    })().catch(() => setMatches([]));
    return () => ctrl.abort();
  }, [category, keyProfile, product?.id]);

  const facet = facetFor(keyProfile);
  if (!category) return null;
  return (
    <section className="matches" aria-labelledby="matches-title">
      <h2 id="matches-title" className="section-head">
        Better matches
      </h2>
      <p className="honesty-line">{COPY.betterMatchesHeader}</p>
      {matches === null && <StatusLine text="Ranking the catalogue…" />}
      {matches?.length === 0 && <p>{COPY.noMatches}. No verified product in this category fits these readings yet.</p>}
      <ul className="match-list">
        {matches?.map(({ m, p }, i) => (
          <li key={m.productId} className={i === 0 ? 'match match-hero' : 'match'}>
            <span className="thumb">
              <Icon name="droplet" size={24} />
            </span>
            <span className="match-text">
              <span className="match-name">{productLine(p)}</span>
              <span className="match-reason">{m.reasonLine}</span>
              <span className="caption">{COPY.linkOutMatch}</span>
            </span>
            <a className="btn btn-secondary btn-sm" href={m.searchUrl} aria-label={`Flipkart search for ${p.brand} ${p.name}`}>
              Flipkart search
              <Icon name="arrow-up-right" size={16} />
            </a>
          </li>
        ))}
      </ul>
      {facet && (
        <p className="facet-line">
          <a className="text-link" href={flipkartFacetSearch(category.replace(/_/g, ' '), facet)}>
            {COPY.flipkartFacetLink(facet)}
          </a>
        </p>
      )}
      {!config.affiliate.flipkart.live && <p className="caption">Links are plain keyword searches with no tracking tag.</p>}
    </section>
  );
}

function HowMade({ ledgers }: { ledgers: HowThisWasMade[] }) {
  const entries = ledgers.flatMap((l) => l.entries);
  const mock = ledgers.some((l) => l.mock);
  return (
    <details className="how-made">
      <summary>
        How this was made
        <Icon name="chevron-right" className="summary-chevron" />
      </summary>
      <p className="how-made-lead">{COPY.howMadeBoundary}</p>
      {mock && <p className="caption">Mock mode: these calls were replayed from recorded fixtures.</p>}
      <div className="table-scroll">
        <table className="data">
          <thead>
            <tr>
              <th scope="col">Call</th>
              <th scope="col">Status</th>
              <th scope="col">Latency</th>
              <th scope="col">Units</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => (
              <tr key={i}>
                <th scope="row">
                  {e.feature.replace(/_/g, ' ')}
                  {e.model && <div className="caption">{e.model}</div>}
                </th>
                <td>{e.status}</td>
                <td>{e.latencyMs} ms</td>
                <td>{e.units}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
