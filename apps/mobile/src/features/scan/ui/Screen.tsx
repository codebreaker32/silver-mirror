import type { ReactNode } from 'react';
import { EmptyState } from '@/components/EmptyState';

export { AppBar, Screen } from '@/components/Screen';
export { ButtonPair } from '@/components/PillButton';
export { Body, Heading, Note, Overline } from '@/components/Text';

/** @deprecated Use EmptyState from @/components. Kept for old call sites: face-frame plate, serif title, muted body, actions. */
export function StateView({ title, body, children }: { title: string; body?: string; children?: ReactNode }) {
  return (
    <EmptyState title={title} body={body}>
      {children}
    </EmptyState>
  );
}
