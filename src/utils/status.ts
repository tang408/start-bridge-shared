export type ProjectStatus =
  | "running"
  | "success"
  | "failed"
  | "match-success"
  | "match-failed";

export const STATUS_MAP: Record<
  ProjectStatus,
  { label: string; pillClass: string; isRunning: boolean }
> = {
  running: { label: "媒合中", pillClass: "running", isRunning: true },
  success: { label: "募資結束", pillClass: "success", isRunning: false },
  failed: { label: "募資失敗", pillClass: "failed", isRunning: false },
  "match-success": {
    label: "媒合成功",
    pillClass: "match-success",
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
  pending: { label: "核對中", rowClass: "is-pending" },
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
