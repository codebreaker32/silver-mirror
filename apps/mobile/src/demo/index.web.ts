import { createDemo } from './create';
import type { Demo, DemoScenario } from './types';

export type { Demo, DemoScenario } from './types';

function scenarioFromUrl(): DemoScenario | null {
  if (typeof window === 'undefined') return null;
  const raw = new URLSearchParams(window.location.search).get('demo');
  if (raw === null) return null;
  if (raw === 'none' || raw === 'demo-reading') return raw;
  return 'reading';
}

const scenario = scenarioFromUrl();

/** Read once at page load, so it holds across in-app navigation. Off unless the URL has `?demo=`. */
export const demo: Demo | null = scenario ? createDemo(scenario) : null;
