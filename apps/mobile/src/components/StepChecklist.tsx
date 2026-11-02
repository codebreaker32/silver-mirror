import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Text, View } from 'react-native';
import type { StepState } from '@skinkey/contracts';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon, type IconName } from './Icon';
import { Txt } from './Text';

export interface ChecklistStep {
  id: string;
  /** Use the done wording once done (COPY.scanStepsDone), never a "✓" appended to the text. */
  label: string;
  state: StepState;
  /** Small stamp after the label, e.g. "Photo deleted · 21:04" on the delete row. */
  stamp?: string;
  /** Muted line under the label (a failure reason, a recovery hint). */
  detail?: string;
}

const STATE_WORD: Record<StepState, string> = {
  pending: 'waiting',
  active: 'in progress',
  done: 'done',
  failed: 'did not finish',
  skipped: 'skipped',
};

/** The announcement for the polite live region: the step in progress, else the last finished one. */
export function checklistAnnouncement(steps: readonly ChecklistStep[]): string | null {
  const active = steps.find((s) => s.state === 'active');
  if (active) return `${active.label}, in progress`;
  const failed = steps.find((s) => s.state === 'failed');
  if (failed) return `${failed.label}, did not finish`;
  const done = [...steps].reverse().find((s) => s.state === 'done');
  return done ? `${done.label}, done` : null;
}

interface StepChecklistProps {
  steps: readonly ChecklistStep[];
  /** Override the announced text (e.g. the scan flow's own wording). null = announce nothing. */
  announcement?: string | null;
  /** Render without the card (inside a sheet that is already a surface). */
  bare?: boolean;
  testID?: string;
}

/**
 * Processing checklist card (component.checklistCard + processingStepper, showcase 03_analyze): a raised white card,
 * radius 16, rows of 52dp+ separated by spacing (no dividers in light). Leading: done = drawn check-circle, current = ring + centre dot in semibold,
 * pending = empty ring, failed = minus ring with a text-colour bar (never red). Trailing state mark: done = a tick in
 * the FITS icon colour, current = three muted dots, pending = nothing. Never a spinner. Each row is one TalkBack node
 * (the marks are decorative); step changes are announced politely.
 */
export function StepChecklist({ steps, announcement, bare = false, testID }: StepChecklistProps) {
  const t = useTheme();
  const c = t.components.checklistCard;
  const p = t.components.processingStepper;
  const said = announcement === undefined ? checklistAnnouncement(steps) : announcement;
  const last = useRef<string | null>(null);

  useEffect(() => {
    if (said && said !== last.current) {
      last.current = said;
      AccessibilityInfo.announceForAccessibility(said);
    }
  }, [said]);

  const iconFor = (s: StepState): IconName =>
    s === 'done' ? (c.doneIcon as IconName) : s === 'active' ? (c.currentIcon as IconName) : s === 'failed' ? 'minus-circle' : (c.pendingIcon as IconName);

  return (
    <View
      testID={testID}
      accessibilityRole="list"
      accessibilityLiveRegion="polite"
      style={
        bare
          ? undefined
          : [
              t.dark
                ? { backgroundColor: t.colors.surfaceRaised, borderWidth: 1, borderColor: t.colors.border, borderTopColor: t.colors.sheenEdge }
                : { backgroundColor: t.colors.surface },
              { borderRadius: c.radius, paddingHorizontal: c.padding, paddingVertical: t.space[1] },
            ]
      }
    >
      {steps.map((step, i) => {
        const pending = step.state === 'pending' || step.state === 'skipped';
        const color = pending ? c.pendingColor : c.iconColor;
        const labelStyle = step.state === 'active' ? c.labelCurrent : c.label;
        return (
          <View
            key={step.id}
            testID={`step-${step.id}`}
            accessible
            accessibilityLabel={`Step ${i + 1} of ${steps.length}: ${step.label}, ${STATE_WORD[step.state]}.${step.stamp ? ` ${step.stamp}.` : ''}${step.detail ? ` ${step.detail}` : ''}`}
            style={{
              minHeight: c.rowMinHeight,
              flexDirection: 'row',
              alignItems: 'center',
              gap: t.space[3],
              paddingVertical: t.space[2],
              borderTopWidth: t.dark && i > 0 ? 1 : 0,
              borderTopColor: t.colors.border,
            }}
          >
            {step.state === 'failed' ? (
              <View style={{ position: 'absolute', left: -c.padding, top: t.space[2], bottom: t.space[2], width: 3, borderRadius: 2, backgroundColor: p.failed.bar }} />
            ) : null}
            <Icon name={iconFor(step.state)} size={t.icon.lg} color={color} strokeWidth={step.state === 'done' ? 1.75 : t.icon.stroke} />
            <View style={{ flex: 1, gap: 2 }}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', columnGap: t.space[2] }}>
                <Txt variant={step.state === 'active' ? 'bodyStrong' : 'body'} style={[labelStyle, { color: pending ? c.pendingColor : t.colors.text }]}>
                  {step.label}
                </Txt>
                {step.stamp ? (
                  <Text {...t.textProps.caption} style={[c.stamp, { color: c.stampColor }]}>
                    {step.stamp}
                  </Text>
                ) : null}
              </View>
              {step.detail ? (
                <Txt variant="caption" style={[p.deletedStep.caption, { color: p.deletedStep.captionColor }]}>
                  {step.detail}
                </Txt>
              ) : null}
            </View>
            {step.state === 'done' ? (
              <Icon name={c.doneTrailing as IconName} size={t.icon.md} color={c.doneTrailingColor} strokeWidth={2} />
            ) : step.state === 'active' ? (
              <Icon name={c.currentTrailing as IconName} size={t.icon.md} color={c.currentTrailingColor} />
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
