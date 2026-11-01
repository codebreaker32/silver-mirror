import type { InciToken, OcrToken } from '@skinkey/contracts';

export interface InciChip {
  id: string;
  text: string;
  uncertain: boolean;
  edited: boolean;
}

let seq = 0;
const nextId = () => `chip-${++seq}`;

export function chipsFromOcr(tokens: readonly OcrToken[]): InciChip[] {
  return tokens
    .map((t) => ({ text: (t.cosingName ?? t.raw).trim(), uncertain: t.uncertain || t.cosingName === null }))
    .filter((t) => t.text.length > 0)
    .map((t) => ({ id: nextId(), text: t.text, uncertain: t.uncertain, edited: false }));
}

export function editChip(chips: readonly InciChip[], id: string, text: string): InciChip[] {
  const value = text.trim();
  if (!value) return removeChip(chips, id);
  return chips.map((c) => (c.id === id ? { ...c, text: value, uncertain: false, edited: true } : c));
}

export const removeChip = (chips: readonly InciChip[], id: string): InciChip[] => chips.filter((c) => c.id !== id);

export function addChip(chips: readonly InciChip[], text: string): InciChip[] {
  const value = text.trim();
  return value ? [...chips, { id: nextId(), text: value, uncertain: false, edited: true }] : [...chips];
}

/** Confirmed chips become the INCI list, in label order (position 1 = first on the label). */
export const chipsToInci = (chips: readonly InciChip[]): InciToken[] => chips.map((c, i) => ({ token: c.text, position: i + 1 }));

export const uncertainCount = (chips: readonly InciChip[]) => chips.filter((c) => c.uncertain).length;
