import { content } from "../content";
import { type Area, type CostInputs, type OneOffBid } from "./estimator";

const inRange = (v: number, min: number, max: number) => Number.isFinite(v) && v >= min && v <= max;

export function validateEstimate(areas: Area[], costs: CostInputs): string[] {
  const e = content.errors;
  const errors: string[] = [];
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

export const oneOffLimits = {
  workers: { min: 1, max: 100, step: 1 },
  onSiteHours: { min: 0.01, max: 24, step: 0.01 },
  travelHours: { min: 0, max: 24, step: 0.25 },
  hours: { min: 0, max: 100_000, step: 0.25 },
  directCosts: { min: 0, max: 10_000_000, step: 0.01 },
  wage: { min: 0.01, max: 10_000, step: 0.01 },
  overheadPct: { min: 0, max: 100, step: 1 },
  marginPct: { min: 0, max: 90, step: 1 },
} as const;

export const MAX_STAGES = 100;

export function validateOneOff(bid: OneOffBid): string[] {
  const { errors: e } = content.oneOff;
  const errors: string[] = [];
  const within = (value: number, field: keyof typeof oneOffLimits) =>
    inRange(value, oneOffLimits[field].min, oneOffLimits[field].max);
  const materials = bid.mode === "job" ? [bid.materials] : bid.stages.map(stage => stage.materials);

  if (bid.mode === "job") {
    if (!Number.isInteger(bid.workers) || !within(bid.workers, "workers")) errors.push(e.workers);
    if (!within(bid.onSiteHours, "onSiteHours")) errors.push(e.onSiteHours);
    if (!within(bid.travelHours, "travelHours")) errors.push(e.travelHours);
  } else {
    if (!bid.stages.some(stage => stage.hours > 0)) errors.push(e.stages);
    if (bid.stages.some(stage => !stage.label.trim())) errors.push(e.stageName);
    if (bid.stages.some(stage => !within(stage.hours, "hours"))) errors.push(e.stageHours);
  }

  if (![...materials, bid.expenses].every(amount => within(amount, "directCosts"))) errors.push(e.directCosts);
  if (!within(bid.wage, "wage")) errors.push(content.errors.wage);
  if (!within(bid.overheadPct, "overheadPct")) errors.push(e.overhead);
  if (!within(bid.marginPct, "marginPct")) errors.push(content.errors.margin);
  return errors;
}
