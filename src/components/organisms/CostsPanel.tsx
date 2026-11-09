import { Button } from "../atoms/Button";
import { NumberField } from "../molecules/NumberField";
import { Notice } from "../molecules/Notice";
import type { CostInputs } from "@/lib/estimator";
import type { Content } from "@/content";

type Key = keyof CostInputs;
const limits: Record<Key, { min: number; max: number; step: number }> = {
  nightsPerWeek: { min: 1, max: 7, step: 1 }, shiftHours: { min: 0, max: 24, step: 0.5 },
  wage: { min: 0, max: 10000, step: 0.25 }, burdenPct: { min: 0, max: 100, step: 1 },
  suppliesPct: { min: 0, max: 100, step: 1 }, overheadPct: { min: 0, max: 100, step: 1 },
  marginPct: { min: 0, max: 90, step: 1 }, quickRate: { min: 0, max: 10000, step: 0.01 },
};
const groups: Key[][] = [["wage", "burdenPct", "nightsPerWeek", "shiftHours"], ["suppliesPct", "overheadPct", "marginPct", "quickRate"]];

type CostsPanelProps = {
  copy: Content["costs"]; costs: CostInputs; onChange: (key: Key, value: number) => void;
  confirmReset: boolean; onAskReset: () => void; onCancelReset: () => void; onReset: () => void;
};

/** Organism: labor, overhead and pricing inputs, grouped by what they drive. */
export function CostsPanel({ copy, costs, onChange, confirmReset, onAskReset, onCancelReset, onReset }: CostsPanelProps) {
  return <section id="costs" className="panel" aria-labelledby="costs-heading">
    <h2 id="costs-heading">{copy.heading}</h2>
    {groups.map((keys, i) => <fieldset key={i} className="cost-group">
      <legend>{i === 0 ? copy.laborGroup : copy.pricingGroup}</legend>
      <div className="cost-fields">{keys.map(key => <NumberField key={key} label={copy.fields[key]} value={costs[key]} {...limits[key]} onChange={value => onChange(key, value)} />)}</div>
    </fieldset>)}
    <p className="assumption">{copy.footnote}</p>
    {confirmReset
      ? <Notice><p>{copy.resetConfirm}</p><div className="notice-actions"><Button onClick={onCancelReset}>{copy.cancelReset}</Button><Button variant="solid" onClick={onReset}>{copy.confirmReset}</Button></div></Notice>
      : <Button variant="link" onClick={onAskReset}>{copy.reset}</Button>}
  </section>;
}
