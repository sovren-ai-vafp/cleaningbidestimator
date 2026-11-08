"use client";

import { useMemo, useState } from "react";
import { content } from "@/content";
import { defaultAreas, defaultCosts, estimate, type Area, type CostInputs } from "@/lib/estimator";

const copy = content.estimator;

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const cents = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 3 });
const hours = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const whole = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

const costFields: { key: keyof CostInputs; step: string }[] = [
  { key: "nightsPerWeek", step: "1" },
  { key: "shiftHours", step: "0.5" },
  { key: "wage", step: "0.25" },
  { key: "burdenPct", step: "1" },
  { key: "suppliesPct", step: "1" },
  { key: "overheadPct", step: "1" },
  { key: "marginPct", step: "1" },
  { key: "quickRate", step: "0.01" },
];

const toNumber = (value: string) => (value === "" ? 0 : Number(value));

export function Estimator() {
  const [areas, setAreas] = useState<Area[]>(defaultAreas);
  const [costs, setCosts] = useState<CostInputs>(defaultCosts);
  const result = useMemo(() => estimate(areas, costs), [areas, costs]);

  const updateArea = (id: string, field: "sqft" | "rate", value: string) =>
    setAreas(current => current.map(area => (area.id === id ? { ...area, [field]: toNumber(value) } : area)));
  const updateCost = (key: keyof CostInputs, value: string) => setCosts(current => ({ ...current, [key]: toNumber(value) }));
  const reset = () => { setAreas(defaultAreas); setCosts(defaultCosts); };

  const underbid = result.gapPerMonth > 0;

  return <div className="estimator">
    <div className="estimator-inputs">
      <fieldset className="estimator-panel">
        <legend><h3>{copy.areasHeading}</h3></legend>
        <div className="estimator-table-wrap">
          <table className="estimator-table">
            <thead><tr><th scope="col">{copy.areaCol}</th><th scope="col">{copy.sqftCol}</th><th scope="col">{copy.rateCol}</th><th scope="col">{copy.hoursCol}</th></tr></thead>
            <tbody>
              {areas.map(area => <tr key={area.id}>
                <th scope="row">{area.label}</th>
                <td><input type="number" min="0" step="100" inputMode="numeric" value={area.sqft} aria-label={`${area.label}, ${copy.sqftCol}`} onChange={event => updateArea(area.id, "sqft", event.target.value)} /></td>
                <td><input type="number" min="0" step="100" inputMode="numeric" value={area.rate} aria-label={`${area.label}, ${copy.rateCol}`} onChange={event => updateArea(area.id, "rate", event.target.value)} /></td>
                <td className="estimator-num">{hours.format(area.rate > 0 ? area.sqft / area.rate : 0)}</td>
              </tr>)}
            </tbody>
            <tfoot><tr><th scope="row">{copy.totalRow}</th><td className="estimator-num">{whole.format(result.totalSqft)}</td><td /><td className="estimator-num">{hours.format(result.hoursPerVisit)}</td></tr></tfoot>
          </table>
        </div>
      </fieldset>

      <fieldset className="estimator-panel">
        <legend><h3>{copy.costsHeading}</h3></legend>
        <div className="estimator-fields">
          {costFields.map(({ key, step }) => <label key={key} className="estimator-field">
            <span>{copy.fields[key]}</span>
            <input type="number" min="0" step={step} inputMode="decimal" value={costs[key]} onChange={event => updateCost(key, event.target.value)} />
          </label>)}
        </div>
        <button type="button" className="estimator-reset" onClick={reset}>{copy.reset}</button>
      </fieldset>
    </div>

    <aside className="estimator-results" aria-live="polite" aria-labelledby="estimator-results-heading">
      <h3 id="estimator-results-heading">{copy.resultsHeading}</h3>
      <p className="estimator-price">{money.format(result.monthlyPrice)}<span>{copy.perMonth}</span></p>
      <p className="estimator-price-label">{copy.results.monthlyPrice}</p>
      <dl className="estimator-stats">
        <div><dt>{copy.results.pricePerSqft}</dt><dd>{cents.format(result.pricePerSqft)}</dd></div>
        <div><dt>{copy.results.monthlyCost}</dt><dd>{money.format(result.monthlyCost)}</dd></div>
        <div><dt>{copy.results.hoursPerVisit}</dt><dd>{hours.format(result.hoursPerVisit)}</dd></div>
        <div><dt>{copy.results.monthlyHours}</dt><dd>{whole.format(result.monthlyHours)}</dd></div>
        <div><dt>{copy.results.cleanersPerNight}</dt><dd>{whole.format(result.cleanersPerNight)}</dd></div>
      </dl>
      <div className="estimator-compare">
        <h4>{copy.compareHeading}</h4>
        <dl className="estimator-stats">
          <div><dt>{copy.quickPrice}</dt><dd>{money.format(result.quickPrice)}{copy.perMonth}</dd></div>
          <div><dt>{copy.quickMargin}</dt><dd className={result.quickMarginPct < costs.marginPct ? "estimator-warn" : undefined}>{hours.format(result.quickMarginPct)}%</dd></div>
        </dl>
        <p className="estimator-gap"><span>{underbid ? copy.underbid : copy.overbid}</span><strong>{money.format(Math.abs(result.gapPerMonth))}{copy.perMonth}</strong></p>
      </div>
      <p className="estimator-footnote">{copy.footnote}</p>
    </aside>
  </div>;
}
