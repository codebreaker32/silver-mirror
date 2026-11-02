import type { ReactNode } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { FaceFrame, SheenBackdrop, SilverMark } from '@/brand';
import { useTheme } from '@/theme/ThemeProvider';
import { IconDisc } from './IconButton';
import type { IconName } from './Icon';
import { Txt } from './Text';

export type EmptyPlate = 'face' | 'mark' | 'none' | { icon: IconName };

interface EmptyStateProps {
  /** Serif display line, e.g. "No reading yet", "Nothing to check yet". */
  title: string;
  /** One muted line naming the next step (or the problem and the recovery). */
  body?: string;
  /** face = face-frame plate on the sheen, mark = chrome-S plate, an icon disc, or none. */
  plate?: EmptyPlate;
  /** One pill action (slate), optionally a tonal second. */
  children?: ReactNode;
  testID?: string;
}

/**
 * Empty / error state (DESIGN.md §8.10, component.stateView): a plate on the sheen, one serif line, one muted line,
 * one pill action. Left-aligned text. Neutral, never red.
 */
export function EmptyState({ title, body, plate = 'face', children, testID }: EmptyStateProps) {
  const t = useTheme();
  const s = t.components.stateView;
  const { width } = useWindowDimensions();
  const plateWidth = Math.min(width - t.spacing.gutter * 2, 360);
  return (
    <View testID={testID} style={{ gap: t.space[5], paddingVertical: t.space[4] }}>
      {plate === 'face' || plate === 'mark' ? (
        <View
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden
          style={{ borderRadius: s.plateRadius, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', paddingVertical: t.space[6] }}
        >
          <SheenBackdrop radius={s.plateRadius} />
          {plate === 'face' ? <FaceFrame width={Math.round(plateWidth * 0.42)} /> : <SilverMark size={96} />}
        </View>
      ) : plate !== 'none' ? (
        <IconDisc icon={plate.icon} large />
      ) : null}
      <View style={{ gap: s.gap }}>
        <Txt accessibilityRole="header" variant="display" style={[s.title, { color: s.titleColor }]}>
          {title}
        </Txt>
        {body ? (
          <Txt variant="body" style={[s.body, { color: s.bodyColor }]}>
            {body}
          </Txt>
        ) : null}
      </View>
      {children ? <View style={{ gap: t.space[3] }}>{children}</View> : null}
    </View>
  );
}
