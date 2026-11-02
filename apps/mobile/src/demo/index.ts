import type { Demo } from './types';

export type { Demo, DemoScenario } from './types';

/**
 * Demo mode exists only in the web build (index.web.ts), and only when the URL carries `?demo=`.
 * It feeds mock data to the screens for design screenshots (scripts/shoot-mobile-web.mjs).
 * Native builds always get null here, so their behaviour never changes.
 */
export const demo: Demo | null = null;
