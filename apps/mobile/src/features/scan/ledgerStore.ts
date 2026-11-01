import { useSyncExternalStore } from 'react';
import type { HowThisWasMade } from '@skinkey/contracts';

export type LedgerKind = 'scan' | 'tryon' | 'resolve' | 'labelOcr';

export interface LedgerRecord {
  kind: LedgerKind;
  at: string;
  ledger: HowThisWasMade;
}

let records: Partial<Record<LedgerKind, LedgerRecord>> = {};
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function recordLedger(kind: LedgerKind, ledger: HowThisWasMade, at: Date = new Date()): void {
  records = { ...records, [kind]: { kind, at: at.toISOString(), ledger } };
  emit();
}

export function clearLedger(kind?: LedgerKind): void {
  if (kind) {
    const { [kind]: _drop, ...rest } = records;
    records = rest;
  } else {
    records = {};
  }
  emit();
}

export function getLedgers() {
  return records;
}

export function useLedgers() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    getLedgers,
    getLedgers,
  );
}
