import { useState, type ReactNode } from 'react';
import type { KeyProfile } from '@skinkey/contracts';
import { haptic } from '@/components';
import { clearLedger } from '../scan/ledgerStore';
import { BandEditSheet } from './BandEditSheet';
import { ConfirmSheet, type ConfirmKind } from './ConfirmSheet';
import { deleteKey, editBand, withdrawConsent } from './index';
import { KeyCard } from './KeyCard';

interface Props {
  keyProfile: KeyProfile;
  isDemo: boolean;
  showGlyph?: boolean;
  /** Replaces the zone glyph (result screen: overlay → glyph). */
  glyph?: ReactNode;
  /** Shown after the reading, before the delete actions. */
  extra?: ReactNode;
  onRemoved: (k: ConfirmKind) => void;
}

export function KeyPanel({ keyProfile, isDemo, showGlyph, glyph, extra, onRemoved }: Props) {
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmKind | null>(null);

  return (
    <>
      <KeyCard
        keyProfile={keyProfile}
        isDemo={isDemo}
        showGlyph={showGlyph}
        glyph={glyph}
        extra={extra}
        onEdit={() => setEditing(true)}
        onDelete={() => setConfirm('delete')}
        onWithdraw={() => setConfirm('withdraw')}
      />
      <BandEditSheet
        visible={editing}
        keyProfile={keyProfile}
        onClose={() => setEditing(false)}
        onSave={async (concern, level) => {
          await editBand(concern, level);
        }}
      />
      <ConfirmSheet
        kind={confirm}
        onClose={() => setConfirm(null)}
        onConfirm={async (kind) => {
          if (kind === 'withdraw') await withdrawConsent();
          else await deleteKey();
          clearLedger('scan');
          haptic('confirm');
          setConfirm(null);
          onRemoved(kind);
        }}
      />
    </>
  );
}
