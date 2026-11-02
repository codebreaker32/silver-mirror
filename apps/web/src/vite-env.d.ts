/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WORKER_URL?: string;
  readonly VITE_APK_URL?: string;
  readonly VITE_SITE_URL?: string;
  readonly VITE_REPORT_URL?: string;
  readonly VITE_AFFILIATE_NYKAA?: string;
  readonly VITE_AFFILIATE_NYKAA_QUERY?: string;
  readonly VITE_AFFILIATE_FLIPKART?: string;
  readonly VITE_AFFILIATE_FLIPKART_QUERY?: string;
}

declare module 'virtual:skinkey-audit' {
  export const summaryJson: unknown;
  export const resultsCsv: string | null;
  /** Served paths of audit files present in this build, keyed by file name (results.csv, review.md, METHOD.md). */
  export const auditFiles: Record<string, string>;
  export const gitTags: Record<string, string | null>;
}
