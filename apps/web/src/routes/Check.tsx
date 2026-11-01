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
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router';
import { SAMPLE_SHARE } from '../../../../packages/contracts/src/proposals/web';
import { VerdictCard } from '../components/VerdictCard';
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

const KEY_OPTIONS = [{ id: 'demo', label: 'Demo Key' }, ...READING_PROFILES.map((p) => ({ id: p.id, label: p.label }))];

const keyFor = (id: string): KeyProfile => {
  const p = READING_PROFILES.find((x) => x.id === id);
  return p ? profileKey(p) : DEMO_KEY;
};

const errorText = (e: unknown) =>
  e instanceof WorkerError
    ? e.status === 0
      ? `The SkinKey Worker isn't reachable from this page (${WORKER_URL}).`
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
  const key = keyFor(keyId);

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

  return (
    <div className="page">
      <div className="page-head">
        <h1>Check a listing.</h1>
        <p>
          Paste a Flipkart, Amazon.in or Nykaa link, or the product title. The web check uses labelled sample readings, so you
          can see the whole flow without a phone or a scan.
        </p>
      </div>

      <div className="two-col page-section" style={{ marginTop: 40, alignItems: 'start' }}>
        <form className="stack" onSubmit={onSubmit}>
          <label className="field-label" htmlFor="listing">
            Link or product title
          </label>
          <textarea
            id="listing"
            className="textarea"
            value={text}
            placeholder="https://www.flipkart.com/… or a product name"
            onChange={(e) => {
              setText(e.target.value);
              setSource('paste');
            }}
          />
          <div className="row">
            <button className="btn btn-primary" type="submit" disabled={!text.trim() || stage.at === 'resolving'}>
              {stage.at === 'resolving' ? 'Checking…' : 'Check this listing'}
            </button>
            <button className="btn btn-secondary" type="button" onClick={runSample} disabled={stage.at === 'resolving'}>
              Try a sample share
            </button>
          </div>
          {source === 'sample' && <p className="small muted">{SAMPLE_SHARE.label}</p>}
        </form>

        <KeyPanel keyId={keyId} setKeyId={setKeyId} keyProfile={key} />
      </div>

      <div className="page-section" style={{ maxWidth: 760 }}>
        {stage.at === 'resolving' && <p className="muted">Reading the listing…</p>}
        {stage.at === 'error' && <p className="error-line">{stage.message}</p>}
        {stage.at === 'confirm' && <Confirm res={stage.res} onYes={(c) => void confirm(stage.res, c)} onNo={() => setStage({ at: 'result', res: stage.res, product: null })} />}
        {stage.at === 'loading_product' && <p className="muted">Loading the product…</p>}
        {stage.at === 'result' && (
          <Result
            res={stage.res}
            product={stage.product}
            keyProfile={key}
            chips={chips}
            setChips={setChips}
            onLedger={(l) => setLedgers((xs) => [...xs, l])}
          />
        )}
        {ledgers.length > 0 && <HowMade ledgers={ledgers} />}
      </div>
    </div>
  );
}

function KeyPanel({ keyId, setKeyId, keyProfile }: { keyId: string; setKeyId: (id: string) => void; keyProfile: KeyProfile }) {
  return (
    <div className="panel">
      <label className="field-label" htmlFor="key-select">
        Readings used for this check
      </label>
      <select id="key-select" className="input" value={keyId} onChange={(e) => setKeyId(e.target.value)}>
        {KEY_OPTIONS.map((o) => (
          <option key={o.id} value={o.id}>
            {o.id === 'demo' ? 'Demo Key (sample readings)' : `Reading profile: ${o.label}`}
          </option>
        ))}
      </select>
      <p className="small muted" style={{ marginTop: 10 }}>
        Sample readings, labelled. Not a scan of anyone. Your own Key is made in the Android app and stays on your phone.
      </p>
      <ul style={{ marginTop: 8 }}>
        {(['oiliness', 'moisture', 'redness', 'pore'] as const).map((c) => (
          <li key={c} className="ui-row">
            <span>{c[0]!.toUpperCase() + c.slice(1)} reading</span>
            <strong>{keyProfile.bands[c].level}</strong>
          </li>
        ))}
      </ul>
      <p className="small muted" style={{ marginTop: 8 }}>
        {COPY.accuracyNote}
      </p>
    </div>
  );
}

function Confirm({ res, onYes, onNo }: { res: ResolveResponse; onYes: (c: ResolveCandidate) => void; onNo: () => void }) {
  const [top, ...rest] = res.candidates;
  if (!top) return null;
  if (res.outcome === 'match')
    return (
      <div className="panel">
        <p className="verdict-sub">
          We think this is <strong>{productLine(top.product)}</strong>.
        </p>
        <div className="row" style={{ marginTop: 16 }}>
          <button className="btn btn-primary" type="button" onClick={() => onYes(top)}>
            Yes
          </button>
          <button className="btn btn-secondary" type="button" onClick={onNo}>
            Not this
          </button>
        </div>
        <p className="small muted" style={{ marginTop: 12 }}>
          No verdict appears before you confirm the product.
        </p>
      </div>
    );
  return (
    <div className="panel">
      <p className="verdict-sub">Which product is it?</p>
      <ul style={{ marginTop: 8 }}>
        {[top, ...rest].map((c) => (
          <li key={c.catalogId} className="candidate">
            <span>{productLine(c.product)}</span>
            <button className="btn btn-secondary btn-sm" type="button" onClick={() => onYes(c)}>
              This one
            </button>
          </li>
        ))}
      </ul>
      <button className="btn btn-secondary btn-sm" type="button" onClick={onNo} style={{ marginTop: 12 }}>
        None of these
      </button>
    </div>
  );
}

function Result({
  res,
  product,
  keyProfile,
  chips,
  setChips,
  onLedger,
}: {
  res: ResolveResponse | null;
  product: CatalogProduct | null;
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
      <div className="panel">
        <p className="verdict-sub">This doesn't look like a skincare listing.</p>
        <p style={{ marginTop: 8 }}>SkinKey checks face skincare: moisturisers, sunscreens, cleansers, serums and tints.</p>
      </div>
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

  return (
    <div className="stack" style={{ display: 'grid', gap: 24 }}>
      {product && <p className="small muted">{productLine(product)}</p>}
      <VerdictCard verdict={v} note={'note' in v ? v.note : undefined} provenanceOverride={confirmed ? `${v.provenance.line} · ${COPY.labelPhotoProvenance}` : undefined} />
      {v.label === 'UNKNOWN' && !confirmed && (
        <LabelPhoto catalogCount={res?.catalogCount ?? null} chips={chips} setChips={setChips} onLedger={onLedger} onConfirm={setConfirmed} />
      )}
      {v.label !== 'MEDICINE' && <BetterMatches product={product} keyProfile={keyProfile} />}
      {shareToken && (
        <p className="small">
          <Link className="text-link" to={`/r/${shareToken}`}>
            Open a shareable result page
          </Link>{' '}
          <span className="muted">(product, label, rule ids and ruleset hash only; no readings, no photo)</span>
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
    <div className="panel">
      {catalogCount != null && <p className="small muted">{COPY.catalogCount(catalogCount)}</p>}
      {!chips ? (
        <>
          <label className="btn btn-primary" style={{ marginTop: 12 }}>
            {busy ? 'Reading the label…' : COPY.snapLabel.replace(/\.$/, '')}
            <input type="file" accept="image/*" capture="environment" className="visually-hidden" disabled={busy} onChange={(e) => void onFile(e.target.files?.[0])} />
          </label>
          <p className="small muted" style={{ marginTop: 10 }}>
            A photo of the ingredient list only. Claude reads it into ingredient names; you check them before any rule runs.
            The photo is not stored.
          </p>
        </>
      ) : (
        <>
          <p className="ui-title">Check the ingredient names</p>
          <p className="small muted" style={{ marginTop: 4 }}>
            Dashed names were hard to read. Edit or remove any name, then run the rules.
            {unreadable > 0 && ` ${unreadable} part${unreadable === 1 ? '' : 's'} of the photo couldn't be read.`}
          </p>
          <div className="chips" style={{ marginTop: 12 }}>
            {chips.map((c) => (
              <span key={c.id} className="chip-edit" data-uncertain={c.uncertain}>
                <input aria-label="Ingredient name" value={c.value} size={Math.max(4, c.value.length)} onChange={(e) => update(c.id, e.target.value)} />
                <button type="button" aria-label={`Remove ${c.value}`} onClick={() => remove(c.id)}>
                  ×
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
          <div className="row" style={{ marginTop: 16 }}>
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
    </div>
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
    <section className="panel" aria-labelledby="matches-title">
      <h2 id="matches-title" className="ui-title">
        Better matches
      </h2>
      <p className="small muted">{COPY.betterMatchesHeader}</p>
      {matches === null && <p className="small muted" style={{ marginTop: 12 }}>Ranking the catalogue…</p>}
      {matches?.length === 0 && <p style={{ marginTop: 12 }}>No verified product in this category fits these readings yet.</p>}
      <ul style={{ marginTop: 8 }}>
        {matches?.map(({ m, p }) => (
          <li key={m.productId} className="candidate">
            <span>
              <strong>{productLine(p)}</strong>
              <span className="small muted" style={{ display: 'block' }}>
                {m.reasonLine}
              </span>
            </span>
            <a className="btn btn-secondary btn-sm" href={m.searchUrl}>
              Flipkart search
            </a>
          </li>
        ))}
      </ul>
      {facet && (
        <p className="small" style={{ marginTop: 12 }}>
          <a className="text-link" href={flipkartFacetSearch(category.replace(/_/g, ' '), facet)}>
            {COPY.flipkartFacetLink(facet)}
          </a>
        </p>
      )}
      {!config.affiliate.flipkart.live && <p className="small muted" style={{ marginTop: 8 }}>Links are plain keyword searches with no tracking tag.</p>}
    </section>
  );
}

function HowMade({ ledgers }: { ledgers: HowThisWasMade[] }) {
  const entries = ledgers.flatMap((l) => l.entries);
  const mock = ledgers.some((l) => l.mock);
  return (
    <details className="panel-sunken" style={{ marginTop: 24 }}>
      <summary style={{ cursor: 'pointer', fontWeight: 600 }}>How this was made</summary>
      {mock && <p className="small muted" style={{ marginTop: 8 }}>Mock mode: these calls were replayed from recorded fixtures.</p>}
      <table className="data" style={{ marginTop: 8 }}>
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
                {e.model && <div className="small muted">{e.model}</div>}
              </th>
              <td>{e.status}</td>
              <td>{e.latencyMs} ms</td>
              <td>{e.units}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}
