import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultAreas, defaultCosts } from "./estimator";
import { validateEstimate } from "./validation";
import { csvCell, makeCsv, parseDraft } from "./draft";

test("default estimate validates; invalid production rates, schedules and margins are blocked", () => {
  assert.deepEqual(validateEstimate(defaultAreas, defaultCosts), []);
  assert.ok(validateEstimate([{ ...defaultAreas[0], rate: 0 }], defaultCosts).length);
  for (const nightsPerWeek of [0, -1, 8, 2.5, NaN]) assert.ok(validateEstimate(defaultAreas, { ...defaultCosts, nightsPerWeek }).length);
  for (const marginPct of [-1, 91, Infinity]) assert.ok(validateEstimate(defaultAreas, { ...defaultCosts, marginPct }).length);
  assert.ok(validateEstimate([], defaultCosts).length);
  assert.deepEqual(validateEstimate([{ ...defaultAreas[0], sqft: 0, rate: 0 }, defaultAreas[1]], defaultCosts), []);
});
test("draft round trip preserves editable data and rejects malformed stored data", () => {
  const draft = { version: 1, client: "Office", notes: "Daily service", areas: defaultAreas, costs: defaultCosts };
  assert.deepEqual(parseDraft(JSON.stringify(draft)), draft);
  for (const invalid of ["null", "{}", "broken", JSON.stringify({ ...draft, costs: {} }), JSON.stringify({ ...draft, areas: [defaultAreas[0], defaultAreas[0]] })]) assert.throws(() => parseDraft(invalid));
});
test("CSV preserves quotes, commas, multiline scope and neutralizes formulas", () => {
  assert.equal(csvCell('Office, "A"'), '"Office, ""A"""');
  assert.equal(csvCell("=SUM(A1)"), '"\'=SUM(A1)"');
  assert.equal(csvCell(-20), '"-20"');
  assert.ok(makeCsv([["line\nline", 12]]).startsWith('\uFEFF"line\nline","12"'));
});
