export type ProjectStatus =
  | "pending-start" // 待啟動
  | "applying" // 申請中
  | "reviewing" // 平台審核中
  | "review-failed" // 審核不通過
  | "review-passed" // 審核通過
  | "running" // 媒合中
  | "match-success" // 媒合成功
  | "joining" // 進入加盟流程
  | "joined-success" // 媒合成功 (深灰)
  | "match-failed"; // 媒合不成立

export const STATUS_MAP: Record<
  ProjectStatus,
  { label: string; pillClass: string; isRunning: boolean }
> = {
  "pending-start": {
    label: "待啟動",
    pillClass: "pending-start",
    isRunning: false,
  },
  applying: { label: "申請中", pillClass: "applying", isRunning: true },
  reviewing: { label: "平台審核中", pillClass: "reviewing", isRunning: true },
  "review-failed": {
    label: "審核不通過",
    pillClass: "review-failed",
    isRunning: false,
  },
  "review-passed": {
    label: "審核通過",
    pillClass: "review-passed",
    isRunning: false,
  },
  running: { label: "媒合中", pillClass: "running", isRunning: true },
  "match-success": {
    label: "媒合成功",
    pillClass: "match-success",
    isRunning: false,
  },
  joining: { label: "進入加盟流程", pillClass: "joining", isRunning: true },
  "joined-success": {
    label: "媒合成功",
    pillClass: "joined-success",
    isRunning: false,
  },
  "match-failed": {
    label: "媒合不成立",
    pillClass: "match-failed",
    isRunning: false,
  },
};

export type TxStatusKey = "success" | "pending" | "failed";
export const TX_STATUS_MAP: Record<
  TxStatusKey,
  { label: string; rowClass: string }
> = {
  success: { label: "成功", rowClass: "is-success" },
  pending: { label: "平台審核中", rowClass: "is-pending" },
  failed: { label: "失敗", rowClass: "is-failed" },
};

export const statusLabel = (s?: string) =>
  (s && STATUS_MAP[s as ProjectStatus]?.label) ?? "";
export const statusClass = (s?: string) =>
  (s && STATUS_MAP[s as ProjectStatus]?.pillClass) ?? "";
export const isRunning = (s?: string) =>
  !!(s && STATUS_MAP[s as ProjectStatus]?.isRunning);

export const txStatusLabel = (k?: string) =>
  (k && TX_STATUS_MAP[k as TxStatusKey]?.label) ?? "";
export const txRowClass = (k?: string) =>
  (k && TX_STATUS_MAP[k as TxStatusKey]?.rowClass) ?? "";
