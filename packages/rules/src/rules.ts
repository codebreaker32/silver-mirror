import type { Rule, SkinTypeClass } from '@skinkey/contracts';
import { SOURCES } from './sources';

export const RULESET_VERSION = '2.0.0';

/** Fragrance substances named individually on EU labels (Reg. 1223/2009 Annex III entries 67-92, the original 26). */
export const EU_LABELLED_FRAGRANCE_SUBSTANCES = [
  'Amyl Cinnamal',
  'Amylcinnamyl Alcohol',
  'Anise Alcohol',
  'Benzyl Benzoate',
  'Benzyl Cinnamate',
  'Benzyl Salicylate',
  'Butylphenyl Methylpropional',
  'Cinnamal',
  'Cinnamyl Alcohol',
  'Citral',
  'Citronellol',
  'Coumarin',
  'Eugenol',
  'Evernia Furfuracea Extract',
  'Evernia Prunastri Extract',
  'Farnesol',
  'Geraniol',
  'Hexyl Cinnamal',
  'Hydroxycitronellal',
  'Hydroxyisohexyl 3-Cyclohexene Carboxaldehyde',
  'Isoeugenol',
  'Limonene',
  'Linalool',
  'Methyl 2-Octynoate',
  'Alpha-Isomethyl Ionone',
] as const;

/**
 * Benzyl Alcohol is entry 69 of the same list but is mostly used as a preservative, and the INCI list cannot say
 * which role it plays, so the fragrance rules skip it (reviewed exclusion, covered by a unit test).
 */
export const FRAGRANCE_LIST_EXCLUSIONS = ['^benzyl alcohol$'] as const;

const ESSENTIAL_OIL_PART = '\\b(leaf|leaves|peel|rind|flower|blossom|petal|bud|herb|bark|root|rhizome|needle|wood|twig|stem|resin)\\b.*\\boil$';
const ESSENTIAL_OIL_GENUS =
  '^(lavandula|mentha|eucalyptus|melaleuca|cymbopogon|rosmarinus|pelargonium|santalum|cananga|pogostemon|cupressus|juniperus|boswellia|commiphora|origanum|thymus|ocimum|cinnamomum|syzygium|eugenia|zingiber|citrus)\\b(?!.*\\b(seed|kernel|nut)\\b).*\\boil$';
const ESSENTIAL_OIL_COMMON =
  '^(tea tree|lavender|peppermint|spearmint|mint|lemon|orange|sweet orange|bergamot|grapefruit|lime|mandarin|eucalyptus|rosemary|lemongrass|clove|geranium|sandalwood|ylang ylang|patchouli|neroli|cinnamon|frankincense|chamomile|basil|tulsi|thyme|ginger|cedarwood|juniper|cypress|vetiver|palmarosa|citronella|jasmine|rose)( (leaf|peel|flower|bud|bark|wood|root))? oil$';
export const ESSENTIAL_OIL_PATTERNS = [ESSENTIAL_OIL_PART, ESSENTIAL_OIL_GENUS, ESSENTIAL_OIL_COMMON] as const;

/** Brand labels such as "Ifra Certified Fragrance" or "Fragrance Oil" still name added fragrance. */
const FRAGRANCE_PATTERNS = ['^(fragrance|parfum|perfume)\\b(?!-free)', '\\b(fragrance|parfum|perfume)$'];

const ALCOHOL_NAMES = ['Alcohol', 'Alcohol Denat.'];
const ALCOHOL_PATTERNS = ['^sd alcohol\\b', '^ethanol$', '^alcohol denat'];
const ALCOHOL_EXCLUDES = [
  '^benzyl alcohol$',
  '^(cetyl|cetearyl|stearyl|behenyl|myristyl|lauryl|oleyl|arachidyl|isostearyl|octyldodecyl|lanolin|phenethyl|dichlorobenzyl|cinnamyl|anise|amylcinnamyl)\\b.*alcohol',
  '\\balcohols$',
];

const REDNESS_CLASSES: SkinTypeClass[] = ['Redness', 'Oily & Redness', 'Dry & Redness', 'Combination & Redness'];
const OILY_CLASSES: SkinTypeClass[] = ['Oily', 'Oily & Redness'];
const DRY_CLASSES: SkinTypeClass[] = ['Dry', 'Dry & Redness'];

/** Medicine gate tokens (spec §2E, brief P4). Matched as whole words; salts and esters (e.g. "Clindamycin Phosphate") included. */
export const MEDICINE_TOKENS: readonly string[] = [
  'adapalene',
  'tretinoin',
  'isotretinoin',
  'tazarotene',
  'trifarotene',
  'benzoyl peroxide',
  'clindamycin',
  'erythromycin',
  'nadifloxacin',
  'metronidazole',
  'dapsone',
  'ketoconazole',
  'clotrimazole',
  'miconazole',
  'luliconazole',
  'hydroquinone',
  'mupirocin',
  'fusidic acid',
  'clobetasol',
  'betamethasone',
  'mometasone',
  'fluocinolone',
  'hydrocortisone',
];

const fit = (rule: Omit<Rule, 'counted' | 'contested' | 'counterSources'> & Partial<Rule>): Rule => ({
  counted: true,
  contested: false,
  counterSources: [],
  ...rule,
});

export const RULES: readonly Rule[] = [
  fit({
    ruleId: 'OCC-1',
    kind: 'FIT_CAUTION',
    grade: 'T',
    triggers: [
      { on: 'band', concern: 'oiliness', levels: ['High'] },
      { on: 'zone', zone: 't_zone', classes: OILY_CLASSES },
    ],
    inciSet: { names: ['Petrolatum', 'Paraffinum Liquidum', 'Cera Microcristallina'], patterns: [], excludes: [] },
    positionLimit: 5,
    template: 'Contains {ingredient} in its first five ingredients, which our rule OCC-1 flags as heavy for oily-looking skin.',
    sources: [SOURCES.fulton1984, SOURCES.cosing],
    counterSources: [SOURCES.draelos2006],
  }),
  fit({
    ruleId: 'OCC-2',
    kind: 'FIT_CAUTION',
    grade: 'L',
    triggers: [
      { on: 'band', concern: 'oiliness', levels: ['High'] },
      { on: 'zone', zone: 't_zone', classes: OILY_CLASSES },
    ],
    inciSet: { names: ['Isopropyl Myristate', 'Isopropyl Palmitate'], patterns: [], excludes: [] },
    template: 'Contains {ingredient}, which our rule OCC-2 flags as heavy for oily-looking skin.',
    sources: [SOURCES.fulton1989],
    counterSources: [SOURCES.draelos2006],
  }),
  fit({
    ruleId: 'FRG-1',
    kind: 'FIT_CAUTION',
    grade: 'R',
    triggers: [
      { on: 'band', concern: 'redness', levels: ['High'] },
      { on: 'zone', zone: 'whole', classes: REDNESS_CLASSES },
    ],
    inciSet: {
      names: ['Parfum', 'Aroma', ...EU_LABELLED_FRAGRANCE_SUBSTANCES],
      patterns: FRAGRANCE_PATTERNS,
      excludes: [...FRAGRANCE_LIST_EXCLUSIONS],
    },
    template: 'Contains {ingredient}, a fragrance ingredient that our rule FRG-1 flags for visible redness.',
    sources: [SOURCES.euFragranceLabelling2023, SOURCES.euCosmeticsRegulation],
  }),
  fit({
    ruleId: 'ALC-1',
    kind: 'FIT_CAUTION',
    grade: 'T',
    triggers: [
      { on: 'band', concern: 'moisture', levels: ['Low'] },
      { on: 'zone', zone: 'u_zone', classes: DRY_CLASSES },
    ],
    inciSet: { names: ALCOHOL_NAMES, patterns: ALCOHOL_PATTERNS, excludes: ALCOHOL_EXCLUDES },
    positionLimit: 5,
    template: 'Contains {ingredient} in its first five ingredients, which our rule ALC-1 flags for dry-looking skin.',
    sources: [SOURCES.lachenmeier2008, SOURCES.cosing],
  }),
  fit({
    ruleId: 'SUP-1',
    kind: 'FIT_SUPPORT',
    grade: 'L',
    triggers: [
      { on: 'band', concern: 'moisture', levels: ['Low'] },
      { on: 'zone', zone: 'u_zone', classes: DRY_CLASSES },
    ],
    inciSet: {
      names: ['Glycerin', 'Sodium Hyaluronate', 'Hyaluronic Acid', 'Ceramide NP', 'Ceramide AP', 'Ceramide EOP'],
      patterns: [],
      excludes: [],
    },
    template: 'Contains {ingredient}, a humectant or ceramide that our rule SUP-1 counts as a fit for dry-looking skin.',
    sources: [SOURCES.fluhr2008, SOURCES.spada2018],
  }),
  fit({
    ruleId: 'SUP-2',
    kind: 'FIT_SUPPORT',
    grade: 'L',
    triggers: [
      { on: 'band', concern: 'oiliness', levels: ['High'] },
      { on: 'zone', zone: 't_zone', classes: OILY_CLASSES },
    ],
    inciSet: { names: ['Niacinamide'], patterns: [], excludes: [] },
    template: 'Contains {ingredient}, which our rule SUP-2 counts as a fit for oily-looking skin.',
    sources: [SOURCES.draelos2006niacinamide],
  }),
  fit({
    ruleId: 'LC-1a',
    kind: 'LABEL_CHECK',
    grade: 'R',
    triggers: [{ on: 'claim', claim: 'fragrance_free' }],
    inciSet: { names: ['Parfum', 'Aroma'], patterns: FRAGRANCE_PATTERNS, excludes: [] },
    template: "Listing says '{claim}'. Its ingredient list has {ingredient} (rule LC-1a).",
    sources: [SOURCES.euCosmeticsRegulation, SOURCES.cosing],
  }),
  fit({
    ruleId: 'LC-1b',
    kind: 'LABEL_CHECK',
    grade: 'R',
    counted: false,
    triggers: [{ on: 'claim', claim: 'fragrance_free' }],
    inciSet: {
      names: [...EU_LABELLED_FRAGRANCE_SUBSTANCES],
      patterns: [...ESSENTIAL_OIL_PATTERNS],
      excludes: [...FRAGRANCE_LIST_EXCLUSIONS],
    },
    template:
      "Listing says '{claim}'. Its ingredient list has {ingredient}, on the EU fragrance labelling list or an essential oil; it may come from a plant extract (rule LC-1b, for information).",
    sources: [SOURCES.euFragranceLabelling2023, SOURCES.euCosmeticsRegulation],
  }),
  fit({
    ruleId: 'LC-2',
    kind: 'LABEL_CHECK',
    grade: 'R',
    triggers: [{ on: 'claim', claim: 'alcohol_free' }],
    inciSet: { names: ALCOHOL_NAMES, patterns: ALCOHOL_PATTERNS, excludes: ALCOHOL_EXCLUDES },
    template: "Listing says '{claim}'. Its ingredient list has {ingredient} (rule LC-2).",
    sources: [SOURCES.cosing],
  }),
  fit({
    ruleId: 'LC-3',
    kind: 'LABEL_CHECK',
    grade: 'T',
    contested: true,
    triggers: [{ on: 'claim', claim: 'oil_free' }],
    inciSet: {
      names: ['Paraffinum Liquidum'],
      patterns: ['\\boil$'],
      excludes: [
        '^peg-',
        '^ppg-',
        '^polyglyceryl-',
        '^hydrogenated\\b.*\\boil$',
        '^sulfated\\b.*\\boil$',
        '\\beth-\\d',
        '^fragrance oil$',
        ...ESSENTIAL_OIL_PATTERNS,
      ],
    },
    template: "Listing says '{claim}'. Its ingredient list has {ingredient} (rule LC-3, contested definition).",
    sources: [SOURCES.teamRule, SOURCES.cosing],
  }),
  fit({
    ruleId: 'MED-1',
    kind: 'MEDICINE',
    grade: null,
    counted: false,
    triggers: [{ on: 'any' }],
    inciSet: { names: [], patterns: MEDICINE_TOKENS.map((t) => `^${t}\\b`), excludes: [] },
    template: "This looks like a medicine (contains {ingredient}). We don't check medicines. Ask a pharmacist or doctor.",
    sources: [SOURCES.cfrAcneActives, SOURCES.euCosmeticsRegulation],
  }),
];

export const CLAIM_PHRASE: Record<string, string> = {
  fragrance_free: 'fragrance-free',
  alcohol_free: 'alcohol-free',
  oil_free: 'oil-free',
  for_oily_skin: 'for oily skin',
  for_dry_skin: 'for dry skin',
  for_combination_skin: 'for combination skin',
  for_sensitive_skin: 'for sensitive skin',
  for_all_skin_types: 'for all skin types',
  one_shade: 'one shade',
  universal_tint: 'universal tint',
};

const GRADE_ORDER = { R: 0, L: 1, T: 2 } as const;
export const gradeRank = (g: Rule['grade']): number => (g ? GRADE_ORDER[g] : 3);
