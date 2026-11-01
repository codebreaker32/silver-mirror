import type { KeyProfile } from './domain';

/** Labelled sample readings for judges and Not-now mode. Never presented as a real scan. */
export const DEMO_KEY: KeyProfile = {
  version: 1,
  source: 'demo',
  scanDate: '2026-11-01T00:00:00.000Z',
  expiresAt: '2099-01-01T00:00:00.000Z',
  copySet: 'B',
  bands: {
    oiliness: { level: 'High', region: 'whole', selfReported: false },
    moisture: { level: 'Medium', region: 'whole', selfReported: false },
    redness: { level: 'Medium', region: 'whole', selfReported: false },
    pore: { level: 'High', region: 'whole', selfReported: false },
  },
  pores: { nose: 'High', cheek: 'Medium', forehead: 'Medium' },
  zones: {},
  selfReported: [],
  photoDeleted: true,
};
