import { createElement, type ComponentType } from 'react';
import { renderToString } from 'react-dom/server';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';
import { summaryJson } from 'virtual:skinkey-audit';
import { Audit } from './Audit';
import { Check } from './Check';
import { How } from './How';
import { Landing } from './Landing';
import { Layout } from './Layout';
import { Rules } from './Rules';

/** Server-renders a route inside the real Layout, so every page in the build is proven to render without throwing. */
function render(path: string, Page: ComponentType) {
  const router = createMemoryRouter([{ element: createElement(Layout), children: [{ path, element: createElement(Page) }] }], {
    initialEntries: [path],
  });
  return renderToString(createElement(RouterProvider, { router }));
}

const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/&#x27;|&#39;/g, "'").replace(/\s+/g, ' ');

describe('web routes render', () => {
  const pages: [string, ComponentType, RegExp][] = [
    ['/', Landing, /SkinKey/],
    ['/check', Check, /./],
    ['/rules', Rules, /./],
    ['/how', How, /Claude/],
    ['/audit', Audit, /One tag, six readings/],
  ];
  for (const [path, Page, expected] of pages) {
    it(path, () => {
      const html = render(path, Page);
      expect(html.length).toBeGreaterThan(500);
      expect(text(html)).toMatch(expected);
      expect(html).toMatch(/<h1/);
    });
  }

  it('/audit is honest when nothing has been checked: no heatmap, no "0 hits" finding', () => {
    const checked = (summaryJson as { population?: { checked?: number } } | null)?.population?.checked ?? 0;
    const t = text(render('/audit', Audit));
    if (checked === 0) {
      expect(t).toMatch(/Nothing checked yet|The audit hasn't run yet/);
      expect(t).not.toMatch(/No label-claim hits in this run/);
      expect(t).not.toMatch(/Top grade R/);
    } else {
      expect(t).toMatch(/Top grade R/);
    }
  });
});
