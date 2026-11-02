import type { ReactNode } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { FaceFrame, SilverMark } from '@/brand';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon, type IconName } from './Icon';
import { Txt } from './Text';

export type EmptyPlate = 'face' | 'mark' | 'none' | { icon: IconName };

interface EmptyStateProps {
  /** Display line (Geist 600 26/32), e.g. "No reading yet", "Nothing to check yet". */
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
 * Empty / error state (DESIGN.md §8.10, component.stateView): a plate on the flat surface tone, one sans display line, one muted line,
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
          style={{ borderRadius: t.radius.lg, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', paddingVertical: t.space[6], backgroundColor: t.colors.surface }}
        >
          {plate === 'face' ? <FaceFrame width={Math.round(plateWidth * 0.42)} tile={false} /> : <SilverMark size={96} />}
        </View>
      ) : null}
      <View style={{ gap: s.gap }}>
        {typeof plate === 'object' ? (
          // A bare 24dp ink glyph above the title, no disc (Silver & graphite: no decorative icon tiles).
          <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
            <Icon name={plate.icon} size={t.icon.lg} color={t.colors.text} />
          </View>
        ) : null}
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
