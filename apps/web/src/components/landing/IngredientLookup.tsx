import { COPY } from '@skinkey/contracts';
import { useDeferredValue, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { lookupIngredient } from '../../lib/rules';
import { describeTriggers, GRADE_LABEL, KIND_LABEL } from '../../lib/rulesText';

const EXAMPLES = ['Isopropyl Myristate', 'Parfum', 'Alcohol Denat.', 'Benzyl Alcohol', 'Niacinamide', 'Adapalene'];

export function IngredientLookup() {
  const [value, setValue] = useState(EXAMPLES[0]!);
  const query = useDeferredValue(value);
  const result = useMemo(() => lookupIngredient(query), [query]);

  return (
    <section className="field-paper lookup" data-tone="paper" aria-labelledby="lookup-title">
      <div className="wrap">
        <div data-reveal>
          <h2 id="lookup-title" className="lookup-intro">
            Type an ingredient.
          </h2>
          <p style={{ marginTop: 8, maxWidth: '52ch' }}>
            See which published rule reads it, and for which reading profile. The rules run here in your browser, the same
            package the app uses.
          </p>
        </div>
        <div className="lookup-field" data-ui>
          <label htmlFor="lookup-input" className="visually-hidden">
            Ingredient name (INCI)
          </label>
          <input
            id="lookup-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="words"
          />
        </div>
        <div className="lookup-examples" role="group" aria-label="Example ingredients">
          {EXAMPLES.map((ex) => (
            <button key={ex} type="button" aria-pressed={value === ex} onClick={() => setValue(ex)}>
              {ex}
            </button>
          ))}
        </div>
        <div className="lookup-answer" aria-live="polite">
          <LookupAnswer value={query} result={result} />
        </div>
      </div>
    </section>
  );
}

function LookupAnswer({ value, result }: { value: string; result: ReturnType<typeof lookupIngredient> }) {
  if (!value.trim()) return <p className="muted">Type an ingredient name as it appears on a label.</p>;
  if (!result)
    return (
      <div className="ui ui-pad" data-ui>
        <p className="ui-title">The rules engine isn't in this build yet.</p>
        <p className="ui-small" style={{ marginTop: 8 }}>
          This lookup runs the real rules package in your browser. It switches on when the package ships its rule set. The
          draft rules are listed on <Link to="/rules">the rules page</Link>.
        </p>
      </div>
    );
  if (result.medicine)
    return (
      <div className="ui ui-pad" data-ui>
        <span className="verdict-tag" data-label="MEDICINE">
          Medicine gate
        </span>
        <p className="ui-title" style={{ marginTop: 12 }}>
          {COPY.medicine(result.medicine)}
        </p>
        <p className="ui-small" style={{ marginTop: 8 }}>
          No verdict and no better matches are shown for gated ingredients.
        </p>
      </div>
    );
  if (!result.hits.length)
    return (
      <div className="ui ui-pad" data-ui>
        <p className="ui-title">No published rule reads “{result.token}”.</p>
        <p className="ui-small" style={{ marginTop: 8 }}>
          {COPY.fitsNoFlags} Spelling matters: rules match CosIng names and a few documented families.
        </p>
      </div>
    );
  return (
    <div className="ui ui-pad" data-ui>
      <p className="ui-small">Rules that read “{result.token}”</p>
      <ul style={{ marginTop: 6 }}>
        {result.hits.map((h) => (
          <li key={h.ruleId} className="ui-row">
            <span className="rule-id">{h.ruleId}</span>
            <span>
              <strong>{h.rule ? KIND_LABEL[h.rule.kind] : 'Rule'}</strong>
              {h.rule?.grade ? ` · grade ${GRADE_LABEL[h.rule.grade]}` : ''}
              {h.rule?.counted === false ? ' · informational' : ''}
              {h.rule?.contested ? ' · contested definition' : ''}
            </span>
            <span />
            <span className="ui-small">
              {h.viaClaim
                ? `${h.rule ? describeTriggers(h.rule) : 'Label claim'}. Shown as an extra reason; it never changes the label alone.`
                : `Fires for: ${[...new Set(h.profiles)].join(', ') || 'none of the six profiles'}.`}
            </span>
          </li>
        ))}
      </ul>
      <p className="ui-small" style={{ marginTop: 10 }}>
        Computed in your browser by the same rules package the app uses. <Link to="/rules">See every rule</Link>.
      </p>
    </div>
  );
}
