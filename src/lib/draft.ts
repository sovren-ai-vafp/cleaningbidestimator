import { type Area, type CostInputs, type OneOffBid, type OneOffMode, type Stage, defaultCosts } from "./estimator";
import { MAX_STAGES } from "./validation";
export const DRAFT_KEY = "sovren-bid-draft-v1";
export const oneOffDraftKey = (mode: OneOffMode) => `sovren-${mode}-bid-draft-v1`;
export type Draft = { version: 1; client: string; notes: string; areas: Area[]; costs: CostInputs };
/** Validate stored data before it ever reaches controlled inputs. Incomplete drafts are allowed. */
export function parseDraft(raw: string): Draft {
  const d = JSON.parse(raw);
  if (d?.version !== 1 || typeof d.client !== "string" || typeof d.notes !== "string" || !Array.isArray(d.areas) || d.areas.length > 100 || !d.costs) throw new Error("Invalid draft");
  const ids = new Set<string>();
  for (const a of d.areas) {
    if (!a || typeof a.id !== "string" || ids.has(a.id) || typeof a.label !== "string" || !Number.isFinite(a.sqft) || !Number.isFinite(a.rate)) throw new Error("Invalid area");
    ids.add(a.id);
  }
  for (const key of Object.keys(defaultCosts) as (keyof CostInputs)[]) if (!Number.isFinite(d.costs[key])) throw new Error("Invalid costs");
  return d;
}

export function parseOneOffDraft(raw: string, mode: OneOffMode): OneOffBid {
  const { version, bid } = JSON.parse(raw) ?? {};
  if (version !== 1 || bid?.mode !== mode || typeof bid.client !== "string" || typeof bid.notes !== "string" ||
    ![bid.wage, bid.expenses, bid.overheadPct, bid.marginPct].every(Number.isFinite)) {
    throw new Error("Invalid bid draft");
  }
  if (bid.mode === "job") {
    if (![bid.workers, bid.onSiteHours, bid.travelHours, bid.materials].every(Number.isFinite)) {
      throw new Error("Invalid job draft");
    }
  } else {
    if (!Array.isArray(bid.stages) || bid.stages.length > MAX_STAGES ||
      !bid.stages.every((stage: Stage) => stage && typeof stage.id === "string" && typeof stage.label === "string" &&
        Number.isFinite(stage.hours) && Number.isFinite(stage.materials)) ||
      new Set(bid.stages.map((stage: Stage) => stage.id)).size !== bid.stages.length) {
      throw new Error("Invalid project draft");
    }
  }
  return bid;
}
export function csvCell(value: string | number): string {
  // Prevent spreadsheet formula execution when client-controlled text is opened in Excel.
  const text = String(value);
  const safe = typeof value === "string" && /^\s*[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
}
export const makeCsv = (rows: (string | number)[][]) => "\uFEFF" + rows.map(row => row.map(csvCell).join(",")).join("\r\n");

export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const url = URL.createObjectURL(new Blob([makeCsv(rows)], { type: "text/csv;charset=utf-8;" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
