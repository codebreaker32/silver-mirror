import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import type { StepState } from '@skinkey/contracts';
import { useTheme } from '@/theme/ThemeProvider';
import { activeStepAnnouncement, type DisplayStep } from '../steps';

function Glyph({ state }: { state: StepState }) {
  const theme = useTheme();
  const p = theme.components.processingStepper;
  const s = p.indicator;
  const r = s / 2;
  return (
    <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      {state === 'done' ? (
        <>
          <Circle cx={r} cy={r} r={r} fill={p.done.fill} />
          <Path d={`M${s * 0.28} ${s * 0.52} l${s * 0.15} ${s * 0.15} l${s * 0.3} -${s * 0.32}`} stroke={p.done.check} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : state === 'active' ? (
        <>
          <Circle cx={r} cy={r} r={r - p.current.ringWidth / 2} stroke={p.current.ring} strokeWidth={p.current.ringWidth} fill="none" />
          <Circle cx={r} cy={r} r={3} fill={p.current.ring} />
        </>
      ) : state === 'failed' ? (
        <>
          <Circle cx={r} cy={r} r={r - p.pending.ringWidth / 2} stroke={theme.colors.text} strokeWidth={p.pending.ringWidth} fill="none" />
          <Path d={`M${s * 0.32} ${r} H${s * 0.68}`} stroke={theme.colors.text} strokeWidth={2} strokeLinecap="round" />
        </>
      ) : (
        <Circle cx={r} cy={r} r={r - p.pending.ringWidth / 2} stroke={p.pending.ring} strokeWidth={p.pending.ringWidth} fill="none" />
      )}
    </Svg>
  );
}

const STATE_WORD: Record<StepState, string> = {
  pending: 'waiting',
  active: 'in progress',
  done: 'done',
  failed: 'did not finish',
  skipped: 'skipped',
};

export function Stepper({ steps }: { steps: readonly DisplayStep[] }) {
  const theme = useTheme();
  const p = theme.components.processingStepper;
  const announcement = activeStepAnnouncement(steps);
  const lastAnnounced = useRef<string | null>(null);

  useEffect(() => {
    if (announcement && announcement !== lastAnnounced.current) {
      lastAnnounced.current = announcement;
      AccessibilityInfo.announceForAccessibility(announcement);
    }
  }, [announcement]);

  return (
    <View accessibilityLiveRegion="polite" accessibilityRole="list">
      {steps.map((step, i) => {
        const tone = step.state === 'active' ? p.current : step.state === 'done' ? p.done : p.pending;
        const isDeleteDone = step.id === 'delete' && step.state === 'done';
        return (
          <View
            key={step.id}
            accessible
            accessibilityLabel={`Step ${i + 1} of ${steps.length}: ${step.label}, ${STATE_WORD[step.state]}.${step.detail ? ` ${step.detail}` : ''}`}
            style={{ flexDirection: 'row', gap: theme.space[3] }}
          >
            <View style={{ alignItems: 'center' }}>
              <View style={{ paddingTop: theme.space[3] }}>
                <Glyph state={step.state} />
              </View>
              {i < steps.length - 1 ? (
                <View
                  style={{
                    flex: 1,
                    width: p.connectorWidth,
                    minHeight: theme.space[3],
                    backgroundColor: step.state === 'done' ? theme.colors.text : p.connector,
                  }}
                />
              ) : null}
            </View>
            <View style={{ flex: 1, minHeight: p.rowMinHeight + theme.space[2], paddingVertical: theme.space[3] }}>
              <Text style={[isDeleteDone ? p.deletedStep.label : tone.label, { color: tone.labelColor }]}>{step.label}</Text>
              {step.detail ? (
                <Text style={[p.deletedStep.caption, { color: p.deletedStep.captionColor, marginTop: theme.space[1] }]}>{step.detail}</Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}
