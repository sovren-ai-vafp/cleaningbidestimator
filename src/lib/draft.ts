import { type Area, type CostInputs, defaultCosts } from "./estimator";
export const DRAFT_KEY = "sovren-bid-draft-v1";
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
export function csvCell(value: string | number): string {
  // Prevent spreadsheet formula execution when client-controlled text is opened in Excel.
  const text = String(value);
  const safe = typeof value === "string" && /^\s*[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
}
export const makeCsv = (rows: (string | number)[][]) => "\uFEFF" + rows.map(row => row.map(csvCell).join(",")).join("\r\n");
