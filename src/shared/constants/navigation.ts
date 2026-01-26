import { AppView } from '@/shared/types';

export const sidebarMenuItems = [
  { id: AppView.DASHBOARD, icon: '🏠', label: '工作台' },
  { id: AppView.DRAFTING, icon: '✍️', label: '说明书撰写' },
  { id: AppView.OA_ASSISTANT, icon: '⚖️', label: '审查意见答复' },
  { id: AppView.UNDERSTANDER, icon: '🧠', label: '技术深度理解' },
  { id: AppView.DIFF_EXPERT, icon: '↔️', label: '差异对比分析' },
] as const;
