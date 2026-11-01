export type YouCamTaskStatus = 'running' | 'success' | 'error';

export type TaskKind = 'skin_analysis' | 'skin_tone' | 'makeup_vto';

export const TASK_PATHS: Record<TaskKind, string> = {
  skin_analysis: '/s2s/v2.1/task/skin-analysis',
  skin_tone: '/s2s/v2.0/task/skin-tone-analysis',
  makeup_vto: '/s2s/v2.0/task/makeup-vto',
};

export const FILE_PATH = '/s2s/v2.0/file';
export const DELETE_PATH = '/s2s/v2.0/task/delete';
export const CREDIT_PATH = '/s2s/v1.0/client/credit';
export const FEATURE_COST_PATH = '/s2s/v2.0/credit/feature-cost';

export interface YouCamFileResponse {
  status?: number;
  data?: { files: YouCamFile[] };
  files?: YouCamFile[];
}

export interface YouCamFile {
  content_type: string;
  file_name: string;
  file_id: string;
  requests: Array<{ url: string; method: string; headers: Record<string, string | number> }>;
}

export interface YouCamTaskCreated {
  status: number;
  data: { task_id: string };
}

export interface YouCamErrorBody {
  status: number;
  error?: string;
  error_code?: string;
}

/** One row of `data.results.output` from HD Skin Analysis v2.1 with format:"json" (spikes/g1_result.json). */
export interface YouCamSkinOutputRow {
  type: string;
  region?: string;
  raw_score?: number;
  ui_score?: number;
  score?: number;
  skin_type?: string;
  mask_urls?: string[];
  url?: string | null;
}

export interface SkinAnalysisResults {
  output: YouCamSkinOutputRow[];
}

export interface SkinToneResults {
  color: { skin_color: string; [k: string]: string };
}

export interface MakeupVtoResults {
  url: string;
}

export interface YouCamTaskStatusResponse<R = unknown> {
  status: number;
  data: {
    task_status: YouCamTaskStatus;
    error?: string | null;
    error_message?: string;
    results?: R;
  };
}

export interface YouCamCreditResponse {
  status: number;
  results: Array<{ id: number; type: string; amount: number; expiry: number }>;
}

export interface YouCamFeatureCostResponse {
  status: number;
  result: {
    next_token: string | null;
    skus: Array<{ description: string; amount: number; unit: string; proc_unit: number; run_task_url: string }>;
  };
}
