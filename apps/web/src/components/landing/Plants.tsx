import { CREDITS } from '../../content/credits';

const [lavender, lemon, castor] = CREDITS;

const ROWS = [
  {
    title: 'Lavender oil under a fragrance-free claim',
    body: 'An essential oil can carry fragrance allergens even when no Parfum is listed. Rule LC-1b notes it as information and keeps it out of the headline count.',
    before: 'Aqua, Glycerin, ',
    token: 'Lavandula Angustifolia Oil',
    after: ', Tocopherol',
    img: lavender,
    alt: 'Botanical plate of lavender: flowering stems with flower and seed details.',
    w: 240,
    h: 300,
  },
  {
    title: 'Limonene, from the lemon',
    body: "Limonene is on the EU's fragrance-allergen labelling list. Under a fragrance-free claim, LC-1b lists it. If Parfum itself appears, strict rule LC-1a counts it.",
    before: 'Glycerin, Niacinamide, ',
    token: 'Limonene',
    after: ', Citral',
    img: lemon,
    alt: 'Botanical plate of a lemon branch with leaves, flowers and a cut fruit.',
    w: 320,
    h: 213,
  },
  {
    title: "Castor oil, and the castor oil that isn't",
    body: 'Under an oil-free claim, Ricinus Communis Seed Oil is a plant oil and LC-3 flags it. PEG-40 Hydrogenated Castor Oil is a solubiliser, so LC-3 leaves it out. The oil-free definition is contested, and the rules page says so.',
    before: 'Aqua, ',
    token: 'Ricinus Communis Seed Oil',
    after: ', PEG-40 Hydrogenated Castor Oil',
    img: castor,
    alt: 'Botanical plate of the castor plant: palmate leaves, spiny seed capsules and seeds.',
    w: 200,
    h: 200,
  },
] as const;

export function Plants() {
  return (
    <section className="field-sunken plants" data-tone="sunken" aria-labelledby="plants-title">
      <div className="wrap">
        <div className="plants-head" data-reveal>
          <h2 id="plants-title">Label Check reads the Latin.</h2>
          <p>
            A listing that says fragrance-free, alcohol-free or oil-free is checked against its own ingredient list, name by
            name. Plants appear there under their botanical names, so the rules have to know them.
          </p>
        </div>
        {ROWS.map((r) => (
          <article className="plant" key={r.token} data-reveal>
            <div className="plant-text">
              <h3>{r.title}</h3>
              <p>{r.body}</p>
              <p className="inci-line">
                Sample label line: {r.before}
                <strong>{r.token}</strong>
                {r.after}
              </p>
            </div>
            <figure>
              <img src={r.img.file} alt={r.alt} width={r.w} height={r.h} loading="lazy" style={{ width: r.w, height: r.h }} />
              <figcaption>
                {r.img.title}, {r.img.creator}, {r.img.date}. {r.img.license}.
              </figcaption>
            </figure>
          </article>
        ))}
      </div>
    </section>
  );
}
