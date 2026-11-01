import { COPY, DEMO_KEY } from '@skinkey/contracts';

const KEEP = (['oiliness', 'moisture', 'redness', 'pore'] as const).map((c) => ({
  concern: c[0]!.toUpperCase() + c.slice(1),
  level: DEMO_KEY.bands[c].level,
}));

const STEPS = [COPY.scanSteps.upload, COPY.scanSteps.analyse, COPY.scanSteps.read, COPY.scanSteps.delete];

export function Honesty() {
  return (
    <section className="field-ink honesty on-ink" data-tone="ink" aria-labelledby="honesty-title">
      <div className="wrap">
        <div className="honesty-grid">
          <div data-reveal>
            <h2 id="honesty-title">What it keeps, and what it won't say.</h2>
          </div>
          <dl data-reveal>
            <div>
              <dt>The photo is deleted from YouCam.</dt>
              <dd>
                <q>{COPY.privacyLine}</q> {COPY.privacyQualifier}
              </dd>
            </div>
            <div>
              <dt>Bands, never scores.</dt>
              <dd>
                Readings show as Low, Medium or High, from YouCam's raw score with cutoffs published before any audit ran.{' '}
                {COPY.accuracyNote} If a band feels wrong, edit it; it is then marked {COPY.selfReported}.
              </dd>
            </div>
            <div>
              <dt>UNKNOWN is an answer.</dt>
              <dd>
                {COPY.subtitle.UNKNOWN} Snap the ingredient list, confirm the names, and the same rules run on what you
                confirmed.
              </dd>
            </div>
            <div>
              <dt>Medicines are not checked.</dt>
              <dd>
                If a listing contains adapalene, benzoyl peroxide or another gated ingredient, there is no verdict. SkinKey
                says to ask a pharmacist or doctor.
              </dd>
            </div>
            <div>
              <dt>No paid placements.</dt>
              <dd>
                {COPY.betterMatchesHeader} Amazon links are never tagged. If a commission link is ever live, the page says
                so, and the ranking ignores it.
              </dd>
            </div>
            <div>
              <dt>Claude reads. Our rules decide.</dt>
              <dd>
                Claude Opus 5.5 turns messy titles and label photos into ingredient names you confirm. It never picks the
                verdict.
              </dd>
            </div>
          </dl>
        </div>
        <div className="honesty-frags">
          <div className="ui ui-pad" data-ui data-reveal>
            <div>
              <p className="ui-title">Making your Key</p>
              <p className="ui-small">Example of the processing screen</p>
              <ol className="status-steps" style={{ marginTop: 14 }}>
                {STEPS.map((s) => (
                  <li key={s} data-state="done">
                    {s}
                  </li>
                ))}
              </ol>
              <p className="ui-small" style={{ marginTop: 14 }}>
                Measured by YouCam Skin Analysis HD, 1 Nov · photo deleted
              </p>
            </div>
          </div>
          <div className="ui ui-pad" data-ui data-reveal>
            <div>
              <p className="ui-title">Demo Key</p>
              <p className="ui-small">Sample readings, labelled. Not a scan of anyone.</p>
              <ul style={{ marginTop: 10 }}>
                {KEEP.map((k) => (
                  <li key={k.concern} className="ui-row">
                    <span>{k.concern} reading</span>
                    <strong>{k.level}</strong>
                  </li>
                ))}
              </ul>
              <p className="ui-small" style={{ marginTop: 8 }}>
                {COPY.accuracyNote}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
