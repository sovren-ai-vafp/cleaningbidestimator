import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultAreas, defaultCosts, estimate, WEEKS_PER_MONTH, quoteCoverage } from "./estimator";

const close = (a: number, b: number, tol = 0.01) => assert.ok(Math.abs(a - b) < tol, `${a} != ${b}`);

test("example building matches a hand calculation", () => {
  const e = estimate(defaultAreas, defaultCosts);
  const hours = 12000 / 3000 + 4000 / 4000 + 1200 / 800 + 800 / 1500 + 2000 / 3500;
  const monthlyHours = hours * 5 * WEEKS_PER_MONTH;
  const labor = monthlyHours * 15 * 1.25;
  const cost = (labor * 1.06) * 1.15;
  close(e.totalSqft, 20000);
  close(e.hoursPerVisit, hours);
  close(e.monthlyCost, cost);
  close(e.monthlyPrice, cost / 0.85);
  close(e.quickPrice, 3600);
  assert.equal(e.cleanersPerNight, 2);
  assert.ok(e.quickMarginPct < 0, "the usual quote should lose money in the example");
});

test("price hits the target margin", () => {
  const e = estimate(defaultAreas, { ...defaultCosts, marginPct: 20 });
  close((e.monthlyPrice - e.monthlyCost) / e.monthlyPrice, 0.2, 1e-9);
});

test("blank or zero inputs never produce NaN or Infinity", () => {
  const e = estimate([{ id: "x", label: "x", sqft: 0, rate: 0 }], { ...defaultCosts, shiftHours: 0, quickRate: 0, nightsPerWeek: 0 });
  for (const [key, value] of Object.entries(e)) assert.ok(Number.isFinite(value), key);
});

test("margin is capped so price stays finite", () => {
  const e = estimate(defaultAreas, { ...defaultCosts, marginPct: 100 });
  assert.ok(Number.isFinite(e.monthlyPrice));
});

test("annual, per-visit price, and profit reconcile", () => {
  const e = estimate(defaultAreas, defaultCosts);
  close(e.annualPrice, e.monthlyPrice * 12);
  close(e.pricePerVisit * e.visitsPerMonth, e.monthlyPrice);
  close(e.profit + e.monthlyCost, e.monthlyPrice);
});

test("zero service nights need no crew and more than seven nights is capped", () => {
  const zero = estimate(defaultAreas, { ...defaultCosts, nightsPerWeek: 0 });
  assert.equal(zero.cleanersPerNight, 0);
  assert.equal(zero.pricePerVisit, 0);
  close(estimate(defaultAreas, { ...defaultCosts, nightsPerWeek: 12 }).visitsPerMonth, 7 * WEEKS_PER_MONTH);
});

test("negative and non-finite inputs do not poison the estimate", () => {
  const e = estimate([{ id: "x", label: "x", sqft: -1, rate: Infinity }], { ...defaultCosts, wage: NaN, marginPct: Infinity });
  for (const [key, value] of Object.entries(e)) assert.ok(Number.isFinite(value), key);
});

test("quoteCoverage names the first cost the usual quote fails to cover", () => {
  const base = estimate(defaultAreas, defaultCosts);
  const at = (quickRate: number) => quoteCoverage(estimate(defaultAreas, { ...defaultCosts, quickRate }));
  const perSqft = (amount: number) => amount / base.totalSqft;
  assert.equal(at(0), "none");
  assert.equal(at(perSqft(base.laborCost) * 0.9), "labor");
  assert.equal(at(perSqft(base.laborCost + base.suppliesCost / 2)), "supplies");
  assert.equal(at(perSqft(base.monthlyCost) * 0.99), "overhead");
  assert.equal(at(defaultCosts.quickRate), "overhead");
  assert.equal(at(perSqft((base.monthlyCost + base.monthlyPrice) / 2)), "profit");
  assert.equal(at(perSqft(base.monthlyPrice) * 1.01), "above");
});
