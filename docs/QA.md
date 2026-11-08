# Estimator UX and QA review

Reviewed November 8, 2026.

## Evaluation and changes

The original labor-based pricing formula was sound for the example inputs. Its main gaps were workflow support and invalid-input handling.

| Finding | Change |
| --- | --- |
| Large introductory layout kept the calculator below the main content | Dashboard with scope, labor, bid, and crew metrics at the top |
| Fixed building areas could not describe a different property | Add, rename, and remove areas; client name and scope notes |
| A positive area with zero production rate contributed no labor cost | Validation suppresses the bid and disables exports until corrected |
| Nights per week were unrestricted; margins above 90% were silently capped | Visible validation for schedule, shift, wage, percentages, rates, and area sizes; pure math also caps service nights at seven |
| No persistence or export | Versioned local draft save/load, CSV with scope and assumptions, and print stylesheet |
| Costs were only visible as a total | Labor, supplies, overhead, profit, annual value, and per-visit price |
| Reset immediately discarded current edits | Inline confirmation with a cancel option; saved draft remains available |

## Automated checks

- `npm run lint`: passed with zero warnings.
- `npm test`: all 10 tests passed.
- `npm run build`: passed, including TypeScript and static prerendering.
- `git diff --check`: passed.

Tests cover the hand-calculated example, margin identity, zero and non-finite inputs, annual/per-visit reconciliation, schedule cap, validation, draft parsing, malformed stored data, and CSV escaping/formula neutralization.

## Browser checks

The user flow is input editing → pure browser calculation → visible bid → local draft or CSV export. There is no API or database boundary in this app.

| Check | Evidence |
| --- | --- |
| Default calculation | 20,000 sq ft, 7.6 labor hours/visit, 2 cleaners, $4,431 monthly bid |
| Custom area recalculation | Adding 1,000 sq ft at 2,000 sq ft/hour changed the bid to $4,722 and crew to 3 |
| Draft persistence | Saved client name, multiline scope, areas, and costs; reloaded page and loaded the saved draft successfully |
| Invalid rate | A zero rate on an included area hid quote amounts, showed an explanation, and disabled print/CSV |
| Area removal | Removed custom area and restored the default computed totals |
| Reset | Confirm and cancel controls rendered and responded; reset restored the example |
| CSV download | Downloaded and parsed 38 rows, including client, multiline scope, inputs, full-precision outputs, and assumptions |
| Mobile | Inspected at 375 × 812; no horizontal page overflow and no visible input/button/link below 44px in height |
| Runtime | No browser console warnings or errors during calculator and draft checks |

## Verification limits and product boundaries

- Print/save PDF has a dedicated print stylesheet, but the browser's print-preview action stalled in the automation environment. Final PDF pagination needs a manual browser check before release.
- Browser checks used a Chromium-based in-app browser, not physical iOS/Android devices or Safari/Firefox. Contrast was addressed through dark text and opaque input surfaces; no formal assistive-technology audit was performed.
- Save draft stores one explicitly saved estimate in this browser/device. It does not sync or autosave. Clearing browser storage removes the draft.
- The model assumes each area's entered scope is cleaned on every visit. Periodic floor work, different task frequencies, equipment costs, and minimum contract charges remain future model extensions rather than implied costs.
- CSV and print are internal planning summaries, including cost and margin information. They are not client-ready legal proposals.
- Default production rates remain Sovren assumptions. Real crew timesheets should drive calibration.
