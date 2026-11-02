import { COPY, DEMO_KEY } from '@skinkey/contracts';
import { BandList } from '../BandList';
import { Icon } from '../Icon';

const STEPS = [COPY.scanStepsDone.upload, COPY.scanStepsDone.analyse, COPY.scanStepsDone.read, COPY.scanStepsDone.delete];

export function Honesty() {
  return (
    <section className="honesty" aria-labelledby="honesty-title">
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
                If a listing contains adapalene, benzoyl peroxide or another gated ingredient, there is no verdict. Silver
                Mirror says to ask a pharmacist or doctor.
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
          <div className="ui-card" data-ui data-reveal>
            <p className="ui-card-title">{COPY.reading.making}</p>
            <p className="ui-caption">Example of the processing screen</p>
            <ol className="checklist">
              {STEPS.map((step, i) => (
                <li key={step}>
                  <Icon name="check-circle" size={24} />
                  <span>{step}</span>
                  {i === STEPS.length - 1 && <span className="stamp">{COPY.reading.photoDeletedStamp}</span>}
                </li>
              ))}
            </ol>
            <p className="ui-caption">Measured by YouCam Skin Analysis HD, 1 Nov · photo deleted</p>
          </div>
          <div className="ui-card" data-ui data-reveal>
            <p className="ui-card-title">
              {COPY.reading.demo}
              <span className="demo-badge">Sample</span>
            </p>
            <p className="ui-caption">Sample readings, labelled. Not a scan of anyone.</p>
            <BandList bands={DEMO_KEY.bands} />
            <p className="ui-caption">{COPY.accuracyNote}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
