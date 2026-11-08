import { workspace } from "../content";
import { type Area, type CostInputs } from "./estimator";
export function validateEstimate(areas: Area[], costs: CostInputs): string[] {
  const e = workspace.errors;
  const errors: string[] = [];
  const inRange = (v: number, min: number, max: number) => Number.isFinite(v) && v >= min && v <= max;
  if (!areas.some(a => a.sqft > 0)) errors.push(e.areas);
  if (areas.some(a => !a.label.trim())) errors.push(e.label);
  if (areas.some(a => !inRange(a.sqft, 0, 1e8))) errors.push(e.sqft);
  if (areas.some(a => a.sqft > 0 && (!inRange(a.rate, 0, 1e8) || a.rate === 0))) errors.push(e.rate);
  if (!Number.isInteger(costs.nightsPerWeek) || !inRange(costs.nightsPerWeek, 1, 7)) errors.push(e.nights);
  if (!inRange(costs.shiftHours, 0, 24) || !costs.shiftHours) errors.push(e.shift);
  if (!inRange(costs.wage, 0, 10000) || !costs.wage) errors.push(e.wage);
  if ([costs.burdenPct, costs.suppliesPct, costs.overheadPct].some(v => !inRange(v, 0, 100))) errors.push(e.percent);
  if (!inRange(costs.marginPct, 0, 90)) errors.push(e.margin);
  if (!inRange(costs.quickRate, 0, 10000)) errors.push(e.quote);
  return errors;
}
