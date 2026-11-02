const COLUMNS = ['How it reads skin', 'Where it works', 'Checks the listing you are on', 'Label-claim check', 'Rules published', 'Photo'];

const ROWS: { name: string; ours?: boolean; cells: string[] }[] = [
  {
    name: 'Flipkart Skin Analyser (ModiFace)',
    cells: [
      'Selfie analysis',
      'Inside the Flipkart app',
      'Recommends from its own catalogue',
      'Not offered, as far as we found',
      'Not published',
      'Not stated in our sources',
    ],
  },
  {
    name: 'Amazon.in SkinCare Analyzer',
    cells: [
      'Quiz answers',
      'Inside Amazon.in',
      'Recommends from its own catalogue',
      'Not offered, as far as we found',
      'Not published',
      'No photo',
    ],
  },
  {
    name: 'Nykaa Skin Scan',
    cells: ['Unverified', 'Inside Nykaa', 'Unverified', 'Unverified', 'Unverified', 'Unverified'],
  },
  {
    name: 'Silver Mirror',
    ours: true,
    cells: [
      'YouCam Skin Analysis HD readings, shown as bands',
      'Share sheet of the Flipkart, Amazon.in and Nykaa Android apps, and this website',
      'Yes, after you confirm the product. UNKNOWN when we lack its ingredient list',
      'Fragrance-free, alcohol-free and oil-free claims against the listing’s own ingredients',
      'Every rule, source and cutoff on the rules page',
      'Deleted from YouCam after the reading',
    ],
  },
];

export function Compare() {
  return (
    <section className="compare" aria-labelledby="compare-title">
      <div className="wrap">
        <div className="compare-head" data-reveal>
          <h2 id="compare-title">Store tools recommend from their own shelf.</h2>
          <p>
            That is how a store-owned tool is built, not a fault. Silver Mirror works the other way round: it starts from the
            product you are already looking at and checks it against your readings.
          </p>
        </div>
        <div className="table-scroll" data-reveal>
          <table className="data">
            <caption className="visually-hidden">Silver Mirror compared with store skin tools</caption>
            <thead>
              <tr>
                <th scope="col">Tool</th>
                {COLUMNS.map((c) => (
                  <th key={c} scope="col">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.name} className={r.ours ? 'ours' : undefined}>
                  <th scope="row">{r.name}</th>
                  {r.cells.map((c, i) => (
                    <td key={i} data-col={COLUMNS[i]}>
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="compare-note">
          Store tools from desk research, November 2026. Whether each one is still live is unverified. Among 356 hackathon
          repo descriptions (snapshot 2026-11-01), none mentions share-in from the store apps or a label-claim check. Closest
          overlaps we know of: before-you-buy (fit verdicts), ShelfSense and dermavto (shade preview), skinshelf (provenance
          receipts).
        </p>
      </div>
    </section>
  );
}
