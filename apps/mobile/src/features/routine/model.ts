import type { ProductCategory } from '@skinkey/contracts';

/** The two routines. Morning protects; evening drops the sunscreen. */
export type RoutineTime = 'am' | 'pm';

/** Only categories the catalogue really carries (no toner step: there is no toner shelf to fill it from). */
export type StepCategory = Extract<ProductCategory, 'cleanser' | 'serum' | 'moisturiser' | 'sunscreen'>;

export interface RoutineStepDef {
  category: StepCategory;
  /** Step name shown in the row: "Cleanser". */
  label: string;
}

const STEP: Record<StepCategory, RoutineStepDef> = {
  cleanser: { category: 'cleanser', label: 'Cleanser' },
  serum: { category: 'serum', label: 'Serum' },
  moisturiser: { category: 'moisturiser', label: 'Moisturiser' },
  sunscreen: { category: 'sunscreen', label: 'Sunscreen' },
};

export const ROUTINE_STEPS: Record<RoutineTime, readonly RoutineStepDef[]> = {
  am: [STEP.cleanser, STEP.serum, STEP.moisturiser, STEP.sunscreen],
  pm: [STEP.cleanser, STEP.serum, STEP.moisturiser],
};

/** Every category any routine needs, once. */
export const ROUTINE_CATEGORIES: readonly StepCategory[] = ['cleanser', 'serum', 'moisturiser', 'sunscreen'];

/** A catalogue product that fits the reading, as a routine row shows it. */
export interface RoutineProduct {
  productId: string;
  brand: string;
  /** Catalogue name without a leading brand. */
  name: string;
  category: StepCategory;
  /** What /check opens with: brand + name, as a pasted name would be. */
  query: string;
  /** One line of why, from the published rules: "Niacinamide · fits your oiliness reading". */
  reason: string;
}

/** Chosen product id per step, per routine: { am: { cleanser: 'id' }, pm: {} }. */
export type RoutineChoices = Record<RoutineTime, Partial<Record<StepCategory, string>>>;

export const EMPTY_CHOICES: RoutineChoices = { am: {}, pm: {} };

export function parseChoices(raw: string | null): RoutineChoices {
  if (!raw) return { am: {}, pm: {} };
  try {
    const v = JSON.parse(raw) as unknown;
    if (!v || typeof v !== 'object') return { am: {}, pm: {} };
    const pick = (slot: unknown): Partial<Record<StepCategory, string>> => {
      const out: Partial<Record<StepCategory, string>> = {};
      if (!slot || typeof slot !== 'object') return out;
      for (const c of ROUTINE_CATEGORIES) {
        const id = (slot as Record<string, unknown>)[c];
        if (typeof id === 'string' && id) out[c] = id;
      }
      return out;
    };
    const o = v as Record<string, unknown>;
    return { am: pick(o.am), pm: pick(o.pm) };
  } catch {
    return { am: {}, pm: {} };
  }
}

export interface FilledStep extends RoutineStepDef {
  /** null when nothing in the catalogue fits the reading for this step. */
  product: RoutineProduct | null;
  /** Other fitting products the shopper can swap to (excludes `product`). */
  alternatives: RoutineProduct[];
}

/**
 * Fills each step of one routine: the stored choice if it still fits the reading, else the first saved product that
 * fits, else the first fitting product in rule order. Pure, so the choice is testable.
 */
export function fillRoutine(
  time: RoutineTime,
  fitting: Partial<Record<StepCategory, readonly RoutineProduct[]>>,
  choices: RoutineChoices,
  savedIds: ReadonlySet<string> = new Set(),
): FilledStep[] {
  return ROUTINE_STEPS[time].map((def) => {
    const list = fitting[def.category] ?? [];
    const chosen = choices[time][def.category];
    const product =
      list.find((p) => p.productId === chosen) ?? list.find((p) => savedIds.has(p.productId)) ?? list[0] ?? null;
    return { ...def, product, alternatives: list.filter((p) => p.productId !== product?.productId) };
  });
}

export function setChoice(choices: RoutineChoices, time: RoutineTime, category: StepCategory, productId: string): RoutineChoices {
  return { ...choices, [time]: { ...choices[time], [category]: productId } };
}
