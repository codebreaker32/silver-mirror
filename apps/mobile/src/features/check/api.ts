import type {
  CatalogProductResponse,
  CatalogSearchResponse,
  LabelOcrRequest,
  LabelOcrResponse,
  ResolveRequest,
  ResolveResponse,
} from '@skinkey/contracts';
import { call } from '@/lib/api';
import { followFlipkartShortLink } from '@/features/share/flipkartFollow';

/** The Worker calls the check flow needs. Injected so the flow can be tested without a network. */
export interface CheckApi {
  resolve(req: ResolveRequest, signal?: AbortSignal): Promise<ResolveResponse>;
  product(id: string, signal?: AbortSignal): Promise<CatalogProductResponse>;
  search(query: { q?: string; category?: string; limit?: number }, signal?: AbortSignal): Promise<CatalogSearchResponse>;
  labelOcr(req: LabelOcrRequest, signal?: AbortSignal): Promise<LabelOcrResponse>;
}

export const workerCheckApi: CheckApi = {
  resolve: async (body, signal) => {
    // Flipkart short links: the phone follows the redirect so the Worker gets the listing URL (BUGS.md item 7).
    const listing = await followFlipkartShortLink(body.url);
    return call('resolve', { body: listing ? { ...body, url: listing } : body, signal });
  },
  product: (id, signal) => call('catalogProduct', { params: { id }, signal }),
  search: ({ q, category, limit }, signal) => {
    const query: Record<string, string> = {};
    if (q) query.q = q;
    if (category) query.category = category;
    if (limit) query.limit = String(limit);
    return call('catalogSearch', { query, signal });
  },
  labelOcr: (body, signal) => call('labelOcr', { body, signal }),
};
