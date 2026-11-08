/**
 * Bid math for the commercial cleaning estimator on /work/cleaning-bid-estimator.
 * Pure functions only, so the numbers can be checked without a browser.
 */

import { content } from "../content";

export type Area = { id: string; label: string; sqft: number; rate: number };

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

const safe = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0);

export const areaHours = (area: Area) => safe(area.rate) ? safe(area.sqft) / area.rate : 0;

export function estimate(areas: Area[], c: CostInputs): Estimate {
  const totalSqft = areas.reduce((sum, a) => sum + safe(a.sqft), 0);
  const hoursPerVisit = areas.reduce((sum, a) => sum + areaHours(a), 0);
  const visitsPerMonth = Math.min(safe(c.nightsPerWeek), 7) * WEEKS_PER_MONTH;
  const monthlyHours = hoursPerVisit * visitsPerMonth;
  const cleanersPerNight = safe(c.shiftHours) ? (visitsPerMonth > 0 ? Math.ceil(hoursPerVisit / c.shiftHours) : 0) : 0;

  const loadedWage = safe(c.wage) * (1 + safe(c.burdenPct) / 100);
  const laborCost = monthlyHours * loadedWage;
  const suppliesCost = laborCost * (safe(c.suppliesPct) / 100);
  const overheadCost = (laborCost + suppliesCost) * (safe(c.overheadPct) / 100);
  const monthlyCost = laborCost + suppliesCost + overheadCost;

  const margin = Math.min(safe(c.marginPct), 90) / 100;
  const monthlyPrice = monthlyCost / (1 - margin);
  const pricePerSqft = totalSqft ? monthlyPrice / totalSqft : 0;

  const quickPrice = safe(c.quickRate) * totalSqft;
  const quickMarginPct = quickPrice ? ((quickPrice - monthlyCost) / quickPrice) * 100 : 0;
  const gapPerMonth = monthlyPrice - quickPrice;

  return {
    totalSqft, hoursPerVisit, visitsPerMonth, monthlyHours, cleanersPerNight, loadedWage,
    laborCost, suppliesCost, overheadCost, monthlyCost, monthlyPrice, pricePerSqft,
    quickPrice, quickMarginPct, gapPerMonth,
    annualPrice: monthlyPrice * 12, profit: monthlyPrice - monthlyCost,
    pricePerVisit: visitsPerMonth ? monthlyPrice / visitsPerMonth : 0,
  };
}
