import { useState } from 'react';
import type { KeyProfile } from '@skinkey/contracts';
import { clearLedger } from '../scan/ledgerStore';
import { haptic } from '../scan/ui';
import { BandEditSheet } from './BandEditSheet';
import { ConfirmSheet, type ConfirmKind } from './ConfirmSheet';
import { deleteKey, editBand, withdrawConsent } from './index';
import { KeyCard } from './KeyCard';

export function KeyPanel({ keyProfile, isDemo, showGlyph, onRemoved }: { keyProfile: KeyProfile; isDemo: boolean; showGlyph?: boolean; onRemoved: (k: ConfirmKind) => void }) {
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmKind | null>(null);

  return (
    <>
      <KeyCard
        keyProfile={keyProfile}
        isDemo={isDemo}
        showGlyph={showGlyph}
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
