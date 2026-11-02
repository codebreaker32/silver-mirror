import { COPY } from '@skinkey/contracts';
import { useDeferredValue, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { lookupIngredient } from '../../lib/rules';
import { describeTriggers, GRADE_LABEL, KIND_LABEL } from '../../lib/rulesText';
import { Icon, VerdictIcon } from '../Icon';

const EXAMPLES = ['Isopropyl Myristate', 'Parfum', 'Alcohol Denat.', 'Benzyl Alcohol', 'Niacinamide', 'Adapalene'];

export function IngredientLookup() {
  const [value, setValue] = useState(EXAMPLES[0]!);
  const query = useDeferredValue(value);
  const result = useMemo(() => lookupIngredient(query), [query]);

  return (
    <section className="lookup" aria-labelledby="lookup-title">
      <div className="lookup-output">
        <div className="lookup-answer" aria-live="polite">
          <LookupAnswer value={query} result={result} />
        </div>
      </div>
      <div className="lookup-controls">
        <div data-reveal>
          <h2 id="lookup-title">Type an ingredient.</h2>
          <p>
            See which published rule reads it, and for which reading profile. The rules run here in your browser, the same
            package the app uses.
          </p>
        </div>
        <div className="lookup-field">
          <label htmlFor="lookup-input" className="field-label">
            Ingredient name (INCI)
          </label>
          <div className="paste-field">
            <Icon name="search" />
            <input
              id="lookup-input"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="words"
            />
          </div>
        </div>
        <div className="lookup-examples" role="group" aria-label="Example ingredients">
          {EXAMPLES.map((ex) => (
            <button key={ex} type="button" className="chip" aria-pressed={value === ex} onClick={() => setValue(ex)}>
              {value === ex && <Icon name="check" size={16} />}
              {ex}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function LookupAnswer({ value, result }: { value: string; result: ReturnType<typeof lookupIngredient> }) {
  if (!value.trim()) return <p className="lookup-empty">Type an ingredient name as it appears on a label.</p>;
  if (!result)
    return (
      <div className="ui-card" data-ui>
        <p className="ui-card-title">The rules engine isn't in this build yet.</p>
        <p className="ui-caption">
          This lookup runs the real rules package in your browser. It switches on when the package ships its rule set. The
          draft rules are listed on <Link to="/rules">the rules page</Link>.
        </p>
      </div>
    );
  if (result.medicine)
    return (
      <div className="ui-card" data-ui>
        <div className="medicine-gate">
          <VerdictIcon label="MEDICINE" size={32} />
          <p className="medicine-line">{COPY.medicine(result.medicine)}</p>
        </div>
        <p className="ui-caption">
          No verdict and no better matches are shown for gated ingredients.
        </p>
      </div>
    );
  if (!result.hits.length)
    return (
      <div className="ui-card" data-ui>
        <p className="ui-card-title">No published rule reads “{result.token}”.</p>
        <ProfileGrid result={result} />
        <p className="ui-caption">
          {COPY.fitsNoFlags} Spelling matters: rules match CosIng names and a few documented families.
        </p>
      </div>
    );
  return (
    <div className="ui-card" data-ui>
      <p className="ui-card-title">Rules that read “{result.token}”</p>
      <ProfileGrid result={result} />
      <ul className="lookup-hits">
        {result.hits.map((h) => (
          <li key={h.ruleId} className="ui-row">
            <span className="rule-id">{h.ruleId}</span>
            <span>
              <strong>{h.rule ? KIND_LABEL[h.rule.kind] : 'Rule'}</strong>
              {h.rule?.grade ? ` · ${GRADE_LABEL[h.rule.grade]}` : ''}
              {h.rule?.counted === false ? ' · informational' : ''}
              {h.rule?.contested ? ' · contested definition' : ''}
            </span>
            <span />
            <span className="ui-caption">
              {h.viaClaim
                ? `${h.rule ? describeTriggers(h.rule) : 'Label claim'}. Shown as an extra reason; it never changes the label alone.`
                : `Fires for: ${[...new Set(h.profiles)].join(', ') || 'none of the six profiles'}.`}
            </span>
          </li>
        ))}
      </ul>
      <p className="ui-caption">
        Computed in your browser by the same rules package the app uses. <Link to="/rules">See every rule</Link>.
      </p>
    </div>
  );
}

/** The same ingredient, one verdict per reading profile: label and icon, never colour alone. */
function ProfileGrid({ result }: { result: NonNullable<ReturnType<typeof lookupIngredient>> }) {
  return (
    <ul className="profile-grid" aria-label="Verdict for each reading profile">
      {result.byProfile.map(({ profile, label }) => (
        <li key={profile.id} className="verdict-tag" data-label={label}>
          <VerdictIcon label={label} size={20} />
          <span className="profile-text">
            <span className="profile-name">{profile.label}</span>
            <span className="profile-label">{label}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
