import { YOUCAM_HD_CONCERNS } from '@skinkey/contracts';

/** P2 (spec §3): HD concerns only, no acne or skin age, single blended overlay, JSON results instead of the zip default. */
export const skinAnalysisBody = (srcFileId: string) => ({
  src_file_id: srcFileId,
  dst_actions: [...YOUCAM_HD_CONCERNS],
  miniserver_args: { enable_mask_overlay: true },
  format: 'json' as const,
});

/** T2: Facial Color Tones on the try-on upload (G2: same file id as the VTO calls). */
export const skinToneBody = (srcFileId: string) => ({ src_file_id: srcFileId });

export type VtoKind = 'foundation' | 'lip_color';

export interface VtoShade {
  name: string;
  hex: string;
}

/**
 * G5 values (spikes/FINDINGS.md): colorIntensity 60 reads clearly side by side; smoothing 10/10 because the docs warn 0 can blend worse
 * and omitting skin_smooth applies a default of 50.
 */
export const VTO_TUNING = {
  foundation: { colorIntensity: 60, glowIntensity: 30, coverageIntensity: 40, skinSmoothStrength: 10, skinSmoothColorIntensity: 10 },
  lip: { colorIntensity: 60, gloss: 40, transparencyIntensity: 40 },
} as const;

export const makeupVtoBody = (srcFileId: string, kind: VtoKind, shade: VtoShade) => {
  const t = VTO_TUNING;
  const effects =
    kind === 'foundation'
      ? [
          {
            category: 'foundation',
            palettes: [
              {
                color: shade.hex,
                colorIntensity: t.foundation.colorIntensity,
                glowIntensity: t.foundation.glowIntensity,
                coverageIntensity: t.foundation.coverageIntensity,
              },
            ],
          },
          {
            category: 'skin_smooth',
            skinSmoothStrength: t.foundation.skinSmoothStrength,
            skinSmoothColorIntensity: t.foundation.skinSmoothColorIntensity,
          },
        ]
      : [
          {
            category: 'lip_color',
            shape: { name: 'original' },
            style: { type: 'full' },
            palettes: [
              {
                color: shade.hex,
                texture: 'sheer',
                colorIntensity: t.lip.colorIntensity,
                gloss: t.lip.gloss,
                transparencyIntensity: t.lip.transparencyIntensity,
              },
            ],
          },
        ];
  return { src_file_id: srcFileId, version: '1.0', effects };
};

/** Makeup VTO rejects width ≥ 1920 or height ≥ 1080 per its error text; the phone sends 768×1024 (G7). */
export const VTO_IMAGE = { width: 768, height: 1024 } as const;
