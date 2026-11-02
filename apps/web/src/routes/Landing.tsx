import { COPY } from '@skinkey/contracts';
import { useRef } from 'react';
import { Link } from 'react-router';
import { useReveal } from '../components/hooks';
import { Icon } from '../components/Icon';
import { AuditProof } from '../components/landing/AuditProof';
import { BuiltOn } from '../components/landing/BuiltOn';
import { Compare } from '../components/landing/Compare';
import { GetTheApp } from '../components/landing/GetTheApp';
import { Honesty } from '../components/landing/Honesty';
import { IngredientLookup } from '../components/landing/IngredientLookup';
import { MirrorPanel, StageFragment, useActiveStage, type StageId } from '../components/landing/Mirror';
import { Plants } from '../components/landing/Plants';

const STAGES: { id: StageId; title: string; body: string; note?: string }[] = [
  {
    id: 'share',
    title: 'First, share the listing.',
    body: `In the Flipkart, Amazon or Nykaa app, tap Share, then ${COPY.appName}. On Amazon it sits under More. On the web, paste the link or the product title.`,
  },
  {
    id: 'confirm',
    title: 'Then confirm the product.',
    body: 'We think this is brand · name · size. Pick it, or choose none of these and get a weaker check by name only. No verdict appears before you pick.',
  },
  {
    id: 'verdict',
    title: 'Then read the reason.',
    body: 'Each reason names your reading, the ingredient and the published rule behind it, under FITS, CAUTION or UNKNOWN. Tinted? YouCam shows two shades on the same photo.',
    note: 'The example is a sample ingredient list and the Demo reading, run by the published rules in your browser.',
  },
];

export function Landing() {
  const root = useRef<HTMLDivElement>(null);
  const stageRoot = useRef<HTMLDivElement>(null);
  useReveal(root);
  const active = useActiveStage(stageRoot);

  return (
    <div ref={root} className="landing">
      <div className="stage" ref={stageRoot}>
        <div className="stage-copy">
          <section className="hero" data-stage="verdict" aria-labelledby="hero-title">
            <div className="hero-inner" data-reveal>
              <h1 id="hero-title">Hold the listing up to your reading.</h1>
              <p className="hero-lead">
                Share a product from the Flipkart, Amazon or Nykaa app. {COPY.appName} checks its ingredient list against your
                YouCam skin reading, and shows the rule behind every reason.
              </p>
              <div className="hero-actions">
                <Link to="/check?sample=1" className="btn btn-primary">
                  Try a sample share
                  <Icon name="arrow-right" />
                </Link>
                <a href="#get" className="btn btn-secondary">
                  Get the Android app
                </a>
              </div>
              <p className="caption">
                {COPY.footer} {COPY.notAffiliated}
              </p>
            </div>
            <div className="stage-inline" aria-hidden="true">
              <StageFragment stage="verdict" />
            </div>
          </section>

          <section className="stages" aria-labelledby="steps-title">
            <h2 id="steps-title" className="visually-hidden">
              How it works
            </h2>
            <ol>
              {STAGES.map((s) => (
                <li key={s.id} className="stage-step" data-stage={s.id}>
                  <div data-reveal>
                    <h3>{s.title}</h3>
                    <p>{s.body}</p>
                    {s.note && <p className="caption">{s.note}</p>}
                  </div>
                  <div className="stage-inline" aria-hidden="true">
                    <StageFragment stage={s.id} />
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
        <div className="stage-side">
          <MirrorPanel active={active} />
        </div>
      </div>

      <IngredientLookup />
      <Plants />
      <AuditProof />
      <Honesty />
      <Compare />
      <BuiltOn />
      <GetTheApp />
    </div>
  );
}
