import { VerdictHead as KitVerdictHead } from '@/components/VerdictHead';
import type { VerdictView } from '../present';
import { useReveal } from './useReveal';

/** Only this block carries the verdict tint (DESIGN.md §8.4). Thin adapter over the shared kit VerdictHead. */
export function VerdictHead({ view, nameOnly = false, demo = false }: { view: VerdictView; nameOnly?: boolean; demo?: boolean }) {
  const reveal = useReveal(`${view.label}|${view.subtitle}`);
  return (
    <KitVerdictHead
      tone={view.tone}
      label={view.labelText}
      line={view.subtitle}
      accessibilityLabel={view.headA11y}
      nameOnly={nameOnly}
      demo={demo}
      revealStyle={reveal}
    />
  );
}
