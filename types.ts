
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  DRAFTING = 'DRAFTING',
  OA_ASSISTANT = 'OA_ASSISTANT',
  UNDERSTANDER = 'UNDERSTANDER',
  DIFF_EXPERT = 'DIFF_EXPERT',
}

export interface AnalysisResult {
  thinking?: string;
  response: string;
  groundingSources?: any[];
}

export interface PatentDoc {
  id: string;
  title: string;
  type: 'draft' | 'oa' | 'ref';
  updatedAt: number;
}
