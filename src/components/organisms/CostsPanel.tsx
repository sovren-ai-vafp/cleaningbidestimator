import { Button } from "../atoms/Button";
import { NumberField } from "../molecules/NumberField";

import type { CostInputs } from "@/lib/estimator";
import type { Content } from "@/content";

type Key = keyof CostInputs;
const limits: Record<Key, { min: number; max: number; step: number }> = {
  nightsPerWeek: { min: 1, max: 7, step: 1 }, shiftHours: { min: 0, max: 24, step: 0.5 },
  wage: { min: 0, max: 10000, step: 0.25 }, burdenPct: { min: 0, max: 100, step: 1 },
  suppliesPct: { min: 0, max: 100, step: 1 }, overheadPct: { min: 0, max: 100, step: 1 },
  marginPct: { min: 0, max: 90, step: 1 }, quickRate: { min: 0, max: 10000, step: 0.01 },
};
const scheduleFields: Key[] = ["nightsPerWeek", "wage", "shiftHours"];
const pricingFields: Key[] = ["burdenPct", "suppliesPct", "overheadPct", "marginPct", "quickRate"];

type CostsPanelProps = {
  copy: Content["costs"]; costs: CostInputs; onChange: (key: Key, value: number) => void;
  pricingOpen: boolean; onTogglePricing: () => void;
};

/** Organism: labor, overhead and pricing inputs, grouped by what they drive. */
export function CostsPanel({ copy, costs, onChange, pricingOpen, onTogglePricing }: CostsPanelProps) {
  const field = (key: Key) => <NumberField key={key} label={copy.fields[key]} value={costs[key]} {...limits[key]} onChange={value => onChange(key, value)} />;

  return <section id="costs" className="panel" aria-labelledby="costs-heading">
    <h2 id="costs-heading">{copy.heading}</h2>
    <div className="cost-fields schedule-fields">{scheduleFields.map(field)}</div>
    <Button variant="quiet" className="pricing-toggle" aria-expanded={pricingOpen} aria-controls="pricing-settings" onClick={onTogglePricing}>
      {copy.pricingGroup}
    </Button>
    <div id="pricing-settings" className="pricing-settings" data-collapsed={!pricingOpen}>
      <div className="cost-fields">{pricingFields.map(field)}</div>
      <p className="assumption">{copy.footnote}</p>
    </div>
  </section>;
}
