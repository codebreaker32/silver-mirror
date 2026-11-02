import { COPY, DEMO_KEY } from '@skinkey/contracts';
import { useEffect, useState, type RefObject } from 'react';
import { safeVerdict } from '../../lib/rules';
import { SilverMark } from '../brand/Brand';
import { Icon } from '../Icon';
import { limitsRow, reasonViews, rulesRow, VerdictHead } from '../VerdictCard';

export type StageId = 'share' | 'confirm' | 'verdict';

/** A sample label, not a real product: the verdict below is computed from it by the published rules, in the browser. */
export const SAMPLE_PRODUCT = { name: 'Sample Gel Moisturiser', size: '50 g' };
export const SAMPLE_INCI = ['Aqua', 'Glycerin', 'Isopropyl Myristate', 'Cetearyl Alcohol', 'Niacinamide', 'Dimethicone', 'Parfum', 'Phenoxyethanol'];

const sampleVerdict = () =>
  safeVerdict({
    key: DEMO_KEY,
    inci: SAMPLE_INCI.map((token, i) => ({ token, position: i + 1 })),
    inciSource: 'label_photo_confirmed',
    claims: [],
    title: SAMPLE_PRODUCT.name,
  });

/** Which [data-stage] block is being read: the last one whose centre (where its copy sits) has risen past 60% of the viewport. */
export function useActiveStage(root: RefObject<HTMLElement | null>, initial: StageId = 'verdict') {
  const [active, setActive] = useState<StageId>(initial);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let frame = 0;
    // Keyed to the block's centre, not its top, so the panel changes as its copy comes into the reading line rather
    // than while the copy is still at the bottom edge; robust to jumps (keyboard, find, anchors).
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.6;
      let current: StageId = initial;
      el.querySelectorAll<HTMLElement>('[data-stage]').forEach((s) => {
        const r = s.getBoundingClientRect();
        if (r.top + r.height / 2 <= line) current = s.dataset.stage as StageId;
      });
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [root, initial]);
  return active;
}

function ShareFragment() {
  const tiles = [
    { label: 'Messages', icon: 'document' as const },
    { label: 'Copy link', icon: 'share' as const },
    { label: 'Nearby', icon: 'phone-lock' as const },
  ];
  return (
    <div className="ui-sheet" data-ui>
      <span className="ui-handle" />
      <p className="ui-sheet-title">Share</p>
      <p className="ui-caption">Check out {SAMPLE_PRODUCT.name} on Nykaa</p>
      <ul className="ui-share-strip">
        {tiles.map((t) => (
          <li key={t.label}>
            <span className="ui-share-tile">
              <Icon name={t.icon} size={24} />
            </span>
            <span>{t.label}</span>
          </li>
        ))}
        <li className="is-target">
          <span className="ui-share-tile">
            <SilverMark size={52} />
          </span>
          <span>{COPY.appName}</span>
        </li>
      </ul>
      <ul className="ui-paths">
        {COPY.sharePaths.map((p) => (
          <li key={p}>
            <Icon name="arrow-down-left" size={16} />
            {p}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ConfirmFragment() {
  const rows = [
    { name: `${SAMPLE_PRODUCT.name}`, size: '50 g · also 100 g', picked: true },
    { name: `${SAMPLE_PRODUCT.name}`, size: '100 g', picked: false },
    { name: `${SAMPLE_PRODUCT.name} SPF 30`, size: '50 g', picked: false, mismatch: 'SPF 30' },
  ];
  return (
    <div className="ui-sheet" data-ui>
      <span className="ui-handle" />
      <p className="ui-sheet-title">{COPY.skuChoose}</p>
      <ul className="ui-candidates">
        {rows.map((r) => (
          <li key={r.name + r.size} data-picked={r.picked ? 'true' : undefined}>
            <span className="ui-thumb">
              <Icon name="droplet" size={20} />
            </span>
            <span className="ui-candidate-text">
              <strong>{r.mismatch ? r.name.replace(` ${r.mismatch}`, '') : r.name}</strong>
              {r.mismatch && <b> {r.mismatch}</b>}
              <span>{r.size}</span>
            </span>
            <Icon name={r.picked ? 'check-circle' : 'circle'} size={24} />
          </li>
        ))}
      </ul>
      <span className="ui-pill ui-pill-tonal">None of these: check by name only</span>
      <p className="ui-caption">We check nothing until you pick.</p>
    </div>
  );
}

function VerdictFragment() {
  const v = sampleVerdict();
  if (!v) return null;
  const reasons = reasonViews(v).slice(0, 2);
  const ledger = [
    { key: 'Reading', value: `${COPY.reading.demo}: labelled sample readings` },
    { key: 'Product', value: 'Sample label, confirmed' },
    { key: 'Rules', value: rulesRow(v).value },
    { key: 'Limits', value: limitsRow.value },
  ];
  return (
    <div className="ui-sheet ui-verdict" data-ui>
      <p className="ui-store">
        <span className="ui-chip">Nykaa</span>
        <span className="ui-caption">{SAMPLE_PRODUCT.size}</span>
      </p>
      <p className="ui-product">{SAMPLE_PRODUCT.name}</p>
      <VerdictHead label={v.label} line={v.subtitle} demo />
      <ul className="ui-reasons">
        {reasons.map((r) => (
          <li key={r.key}>
            {r.reading && <p className="reason-reading">{r.reading}</p>}
            <p className="reason-fact">{r.fact}</p>
            <p className="reason-tag">{r.tag}</p>
          </li>
        ))}
      </ul>
      <dl className="ui-ledger">
        {ledger.map((r) => (
          <div key={r.key}>
            <dt>{r.key}</dt>
            <dd>{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function StageFragment({ stage }: { stage: StageId }) {
  if (stage === 'share') return <ShareFragment />;
  if (stage === 'confirm') return <ConfirmFragment />;
  return <VerdictFragment />;
}

/**
 * The fixed half of the landing split: one rounded panel on the sheen that holds the app's own screens, built in HTML
 * at true size, and changes as each stage of the copy column reaches the middle of the screen.
 */
export function MirrorPanel({ active }: { active: StageId }) {
  const stages: StageId[] = ['share', 'confirm', 'verdict'];
  return (
    <div className="mirror" aria-hidden="true">
      <div className="mirror-stage">
        {stages.map((s) => (
          <div key={s} className="mirror-frame" data-active={s === active ? 'true' : undefined}>
            <StageFragment stage={s} />
          </div>
        ))}
      </div>
      <p className="mirror-bar">
        <span>{COPY.reading.demo} · sample label</span>
        <span>Rules run in your browser</span>
      </p>
    </div>
  );
}
