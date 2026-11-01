const env = import.meta.env;
const on = (v: string | undefined) => v === 'on' || v === '1' || v === 'true';

export const config = {
  workerUrl: env.VITE_WORKER_URL ?? 'http://localhost:8787',
  /** GitHub Releases APK link. Unset until the first signed release exists. */
  apkUrl: env.VITE_APK_URL || null,
  siteUrl: env.VITE_SITE_URL || null,
  /** Where "Report an error / brand reply" points (an issue tracker or mail address). */
  reportUrl: env.VITE_REPORT_URL || null,
  affiliate: {
    nykaa: { live: on(env.VITE_AFFILIATE_NYKAA), query: env.VITE_AFFILIATE_NYKAA_QUERY ?? '' },
    flipkart: { live: on(env.VITE_AFFILIATE_FLIPKART), query: env.VITE_AFFILIATE_FLIPKART_QUERY ?? '' },
  },
} as const;

export type AffiliateConfig = typeof config.affiliate;
