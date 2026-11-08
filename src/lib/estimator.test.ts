import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultAreas, defaultCosts, estimate, WEEKS_PER_MONTH } from "./estimator";

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
