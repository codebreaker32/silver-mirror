import type { Source } from '@skinkey/contracts';

/**
 * Every URL here was opened on 2026-11-01 and its title checked against the citation: PubMed/NCBI pages via E-utilities,
 * the SCC library scan of Fulton 1989, LII for 21 CFR 333.310, CosIng directly. EUR-Lex answers bots with a challenge
 * page, so the two ELI links were confirmed through search-engine index entries for the same URL.
 */
export const SOURCES = {
  euFragranceLabelling2023: {
    citation: 'Commission Regulation (EU) 2023/1545, amending Annex III of Regulation (EC) No 1223/2009 (fragrance labelling list)',
    url: 'https://eur-lex.europa.eu/eli/reg/2023/1545/oj',
  },
  euCosmeticsRegulation: {
    citation: 'Regulation (EC) No 1223/2009 on cosmetic products, Annex III entries 67-92 (fragrance substances named on the label)',
    url: 'https://eur-lex.europa.eu/eli/reg/2009/1223/oj',
  },
  cosing: {
    citation: 'European Commission CosIng ingredient database (INCI names and functions)',
    url: 'https://ec.europa.eu/growth/tools-databases/cosing/',
  },
  fulton1989: {
    citation: 'Fulton JE. Comedogenicity and irritancy of commonly used ingredients in skin care products. J Soc Cosmet Chem 1989;40:321-333 (rabbit-ear model)',
    url: 'https://library.scconline.org/v040n06/13',
  },
  fulton1984: {
    citation: 'Fulton JE et al. Comedogenicity of current therapeutic products, cosmetics, and ingredients in the rabbit ear. J Am Acad Dermatol 1984',
    url: 'https://pubmed.ncbi.nlm.nih.gov/6229554/',
  },
  draelos2006: {
    citation: 'Draelos ZD, DiNardo JC. A re-evaluation of the comedogenicity concept. J Am Acad Dermatol 2006 (human model: finished products with comedogenic-listed ingredients are not necessarily comedogenic)',
    url: 'https://pubmed.ncbi.nlm.nih.gov/16488305/',
  },
  lachenmeier2008: {
    citation: 'Lachenmeier DW 2008, J Occup Med Toxicol 3:26, review of topical ethanol; links it to irritation mainly with ALDH deficiency and does not study dry-looking skin',
    url: 'https://pubmed.ncbi.nlm.nih.gov/19014531/',
  },
  fluhr2008: {
    citation: 'Fluhr JW et al. Glycerol and the skin: holistic approach to its origin and functions. Br J Dermatol 2008',
    url: 'https://pubmed.ncbi.nlm.nih.gov/18510666/',
  },
  spada2018: {
    citation: "Spada F et al. Skin hydration is significantly increased by a cream formulated to mimic the skin's own natural moisturizing systems. Clin Cosmet Investig Dermatol 2018",
    url: 'https://pubmed.ncbi.nlm.nih.gov/30410378/',
  },
  draelos2006niacinamide: {
    citation: 'Draelos ZD et al. The effect of 2% niacinamide on facial sebum production. J Cosmet Laser Ther 2006',
    url: 'https://pubmed.ncbi.nlm.nih.gov/16766489/',
  },
  cfrAcneActives: {
    citation: 'US 21 CFR 333.310, acne active ingredients (benzoyl peroxide is regulated as an OTC drug active)',
    url: 'https://www.law.cornell.edu/cfr/text/21/333.310',
  },
  youcamRawScore: {
    citation: 'YouCam AI Skin Analysis docs: raw_score runs 1-100 and a higher score means healthier-looking skin (docs/youcam/md/reference_ai_skin_analysis.md:295)',
  },
  teamRule: { citation: 'SkinKey team rule (no external evidence that it changes how skin looks for a given reading)' },
} as const satisfies Record<string, Source>;
