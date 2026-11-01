import { useRef } from 'react';
import { Link } from 'react-router';
import { useReveal } from '../components/hooks';
import { LabelSlot } from '../components/LabelSlot';
import { BuiltOn } from '../components/landing/BuiltOn';
import { Compare } from '../components/landing/Compare';
import { GetTheApp } from '../components/landing/GetTheApp';
import { Honesty } from '../components/landing/Honesty';
import { IngredientLookup } from '../components/landing/IngredientLookup';
import { Plants } from '../components/landing/Plants';

function HeroTitle() {
  const lines = (
    <>
      <span className="line">The tag says</span>
      <span className="line">
        oily skin.
        <LabelSlot />
      </span>
    </>
  );
  return (
    <div className="hero-title">
      <h1 id="hero-title" className="copy copy-top">
        {lines}
      </h1>
      <div className="copy copy-bottom" aria-hidden="true">
        <span className="line" data-text="The tag says" />
        <span className="line" data-text="oily skin.">
          <LabelSlot />
        </span>
      </div>
    </div>
  );
}

const STEPS = [
  {
    title: 'First, share the listing.',
    body: 'In the Flipkart or Amazon.in app, tap Share, then SkinKey. On the web, paste the link or the product title.',
  },
  {
    title: 'Then confirm the product.',
    body: 'We think this is brand · name · size. Yes, or Not this. No verdict appears before you say yes.',
  },
  {
    title: 'Then read the reason.',
    body: 'Your reading, the named ingredient and the rule behind it, under FITS, CAUTION or UNKNOWN. Tinted? YouCam shows two shades on the same photo.',
  },
];

export function Landing() {
  const root = useRef<HTMLDivElement>(null);
  useReveal(root);

  return (
    <div ref={root}>
      <section className="hero" data-tone="paper" aria-labelledby="hero-title">
        <HeroTitle />
        <div className="hero-foot" data-reveal>
          <p>
            Your scan and the ingredients get a vote. SkinKey checks that claim against the product's own ingredient list and
            your YouCam Skin Analysis readings, from the Flipkart or Amazon.in app you're already in.
          </p>
          <div className="hero-actions">
            <Link to="/check?sample=1" className="btn btn-paper">
              Try a sample share
            </Link>
            <a href="#get" className="btn btn-secondary">
              Get the Android app
            </a>
          </div>
        </div>
      </section>

      <section className="field-ink steps" data-tone="ink" aria-labelledby="steps-title">
        <div className="hero-after" />
        <div className="wrap">
          <h2 id="steps-title" className="visually-hidden">
            How it works
          </h2>
          <ol>
            {STEPS.map((s) => (
              <li key={s.title} data-reveal>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <IngredientLookup />
      <Plants />
      <Honesty />
      <Compare />
      <BuiltOn />

      <section className="field-ink close" data-tone="ink" id="get" aria-labelledby="close-title">
        <div className="wrap" data-reveal>
          <h2 id="close-title">
            Give the label
            <br />a vote.
          </h2>
        </div>
        <div className="wrap close-foot">
          <div data-reveal>
            <p>
              No phone yet? The web check replays a sample share with a labelled Demo Key. No scan, no sign-up.
            </p>
            <GetTheApp />
          </div>
          <div data-reveal>
            <Link to="/check?sample=1" className="btn btn-paper" style={{ minHeight: 56 }}>
              Try a sample share
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
