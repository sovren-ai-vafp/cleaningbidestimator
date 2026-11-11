/**
 * Bid math for recurring cleaning contracts, one-time jobs, and projects.
 * Pure functions only, so the numbers can be checked without a browser.
 */

import { content } from "../content";

export type Area = { id: string; label: string; sqft: number; rate: number };
export type BidMode = "cleaning" | "job" | "project";
export type OneOffMode = Exclude<BidMode, "cleaning">;
export type Stage = { id: string; label: string; hours: number; materials: number };

type OneOffTerms = {
  client: string;
  notes: string;
  wage: number;
  expenses: number;
  overheadPct: number;
  marginPct: number;
};

export type JobBid = OneOffTerms & {
  mode: "job";
  workers: number;
  onSiteHours: number;
  travelHours: number;
  materials: number;
};
export type ProjectBid = OneOffTerms & { mode: "project"; stages: Stage[] };
export type OneOffBid = JobBid | ProjectBid;

export type CostInputs = {
  nightsPerWeek: number;
  wage: number;          // $ per hour paid to the cleaner
  burdenPct: number;     // payroll taxes, workers' comp, benefits, as % of wage
  suppliesPct: number;   // supplies and consumables, as % of labor cost
  overheadPct: number;   // supervision, insurance, office, as % of labor + supplies
  marginPct: number;     // target profit, as % of price
  shiftHours: number;    // hours one cleaner works per night
  quickRate: number;     // the owner's usual price, $ per sq ft per month
};

export type Estimate = {
  totalSqft: number;
  hoursPerVisit: number;
  visitsPerMonth: number;
  monthlyHours: number;
  cleanersPerNight: number;
  loadedWage: number;
  laborCost: number;
  suppliesCost: number;
  overheadCost: number;
  monthlyCost: number;
  monthlyPrice: number;
  pricePerSqft: number;
  quickPrice: number;
  quickMarginPct: number;
  gapPerMonth: number;
  annualPrice: number;
  profit: number;
  pricePerVisit: number;
};

/** Average weeks in a month (52 / 12). */
export const WEEKS_PER_MONTH = 52 / 12;

/** Starting production rates in sq ft cleaned per labor hour. Editable in the tool. */
export const defaultAreas: Area[] = [
  { id: "offices", label: content.areaLabels[0], sqft: 12000, rate: 3000 },
  { id: "halls", label: content.areaLabels[1], sqft: 4000, rate: 4000 },
  { id: "restrooms", label: content.areaLabels[2], sqft: 1200, rate: 800 },
  { id: "breakrooms", label: content.areaLabels[3], sqft: 800, rate: 1500 },
  { id: "conference", label: content.areaLabels[4], sqft: 2000, rate: 3500 },
  { id: "medical", label: content.areaLabels[5], sqft: 0, rate: 1200 },
];

export const defaultCosts: CostInputs = {
  nightsPerWeek: 5,
  wage: 15,
  burdenPct: 25,
  suppliesPct: 6,
  overheadPct: 15,
  marginPct: 15,
  shiftHours: 4,
  quickRate: 0.18,
};

export const defaultJob: JobBid = {
  mode: "job",
  client: content.oneOff.job.example,
  notes: "",
  workers: 2,
  onSiteHours: 1.5,
  travelHours: 0.5,
  wage: 28,
  materials: 18,
  expenses: 22,
  overheadPct: 10,
  marginPct: 20,
};

export const defaultProject: ProjectBid = {
  mode: "project",
  client: content.oneOff.project.example,
  notes: "",
  wage: 32,
  expenses: 0,
  overheadPct: 10,
  marginPct: 20,
  stages: [
    { id: "prep", label: content.oneOff.project.stageLabels[0], hours: 6, materials: 80 },
    { id: "paint", label: content.oneOff.project.stageLabels[1], hours: 12, materials: 260 },
    { id: "cleanup", label: content.oneOff.project.stageLabels[2], hours: 2, materials: 20 },
  ],
};

const safe = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0);

export const areaHours = (area: Area) => safe(area.rate) ? safe(area.sqft) / area.rate : 0;

function priceWork(laborCost: number, directCosts: number, overheadPct: number, marginPct: number) {
  const overheadCost = (laborCost + directCosts) * (safe(overheadPct) / 100);
  const totalCost = laborCost + directCosts + overheadCost;
  const margin = Math.min(safe(marginPct), 90) / 100;
  const price = totalCost / (1 - margin);
  return { overheadCost, totalCost, price, profit: price - totalCost };
}

export function estimateOneOff(bid: OneOffBid) {
  const hours = bid.mode === "job"
    ? safe(bid.workers) * (safe(bid.onSiteHours) + safe(bid.travelHours))
    : bid.stages.reduce((total, stage) => total + safe(stage.hours), 0);
  const materials = bid.mode === "job"
    ? safe(bid.materials)
    : bid.stages.reduce((total, stage) => total + safe(stage.materials), 0);
  const laborCost = hours * safe(bid.wage);
  const directCosts = materials + safe(bid.expenses);
  return { hours, materials, laborCost, directCosts, ...priceWork(laborCost, directCosts, bid.overheadPct, bid.marginPct) };
}

export function estimate(areas: Area[], c: CostInputs): Estimate {
  const totalSqft = areas.reduce((sum, a) => sum + safe(a.sqft), 0);
  const hoursPerVisit = areas.reduce((sum, a) => sum + areaHours(a), 0);
  const visitsPerMonth = Math.min(safe(c.nightsPerWeek), 7) * WEEKS_PER_MONTH;
  const monthlyHours = hoursPerVisit * visitsPerMonth;
  const cleanersPerNight = safe(c.shiftHours) ? (visitsPerMonth > 0 ? Math.ceil(hoursPerVisit / c.shiftHours) : 0) : 0;

  const loadedWage = safe(c.wage) * (1 + safe(c.burdenPct) / 100);
  const laborCost = monthlyHours * loadedWage;
  const suppliesCost = laborCost * (safe(c.suppliesPct) / 100);
  const { overheadCost, totalCost: monthlyCost, price: monthlyPrice, profit } =
    priceWork(laborCost, suppliesCost, c.overheadPct, c.marginPct);
  const pricePerSqft = totalSqft ? monthlyPrice / totalSqft : 0;

  const quickPrice = safe(c.quickRate) * totalSqft;
  const quickMarginPct = quickPrice ? ((quickPrice - monthlyCost) / quickPrice) * 100 : 0;
  const gapPerMonth = monthlyPrice - quickPrice;

  return {
    totalSqft, hoursPerVisit, visitsPerMonth, monthlyHours, cleanersPerNight, loadedWage,
    laborCost, suppliesCost, overheadCost, monthlyCost, monthlyPrice, pricePerSqft,
    quickPrice, quickMarginPct, gapPerMonth,
    annualPrice: monthlyPrice * 12, profit,
    pricePerVisit: visitsPerMonth ? monthlyPrice / visitsPerMonth : 0,
  };
}

export type Coverage = "none" | "labor" | "supplies" | "overhead" | "profit" | "above";

/**
 * Which part of the bid the owner's usual quote fails to cover.
 * "labor" means it doesn't even cover labor; "above" means it clears the full target price.
 */
export function quoteCoverage(e: Estimate): Coverage {
  const q = e.quickPrice;
  if (!(q > 0)) return "none";
  if (q < e.laborCost) return "labor";
  if (q < e.laborCost + e.suppliesCost) return "supplies";
  if (q < e.monthlyCost) return "overhead";
  if (q < e.monthlyPrice) return "profit";
  return "above";
}
