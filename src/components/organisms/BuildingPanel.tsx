import { Button } from "../atoms/Button";
import { Input, TextArea } from "../atoms/Input";
import { Field } from "../molecules/Field";
import { AreaRow } from "../molecules/AreaRow";
import type { Area } from "@/lib/estimator";
import type { Content } from "@/content";

type BuildingPanelProps = {
  copy: Content["building"];
  client: string; notes: string; areas: Area[];
  hours: (area: Area) => string; totalSqft: string; totalHours: string;
  onClient: (value: string) => void; onNotes: (value: string) => void;
  onArea: (id: string, field: "label" | "sqft" | "rate", value: string) => void;
  onAdd: () => void; onRemove: (id: string) => void;
};

/** Organism: the client, each area of the building and the scope notes. */
export function BuildingPanel({ copy, client, notes, areas, hours, totalSqft, totalHours, onClient, onNotes, onArea, onAdd, onRemove }: BuildingPanelProps) {
  return <section id="building" className="panel" aria-labelledby="building-heading">
    <h2 id="building-heading">{copy.heading}</h2>
    <p className="panel-intro">{copy.intro}</p>
    <Field label={copy.client} className="client-field"><Input value={client} maxLength={160} onChange={e => onClient(e.target.value)} /></Field>
    <div className="area-table">
      <div className="area-row area-head" aria-hidden="true"><span>{copy.areaCol}</span><span>{copy.sqftCol}</span><span>{copy.rateCol}</span><span>{copy.hoursCol}</span><span /></div>
      {areas.map(area => <AreaRow key={area.id} label={area.label} sqft={area.sqft} rate={area.rate} hours={hours(area)} labels={copy}
        onChange={(field, value) => onArea(area.id, field, value)} onRemove={() => onRemove(area.id)} />)}
      {areas.length === 0 ? <p className="panel-intro">{copy.empty}</p> : null}
      <div className="area-row area-total"><span>{copy.total}</span><span>{totalSqft}</span><span /><span>{totalHours}</span><span /></div>
    </div>
    <Button variant="link" className="add-area" onClick={onAdd} disabled={areas.length >= 100}>+ {copy.addArea}</Button>
    <p className="assumption">{copy.assumption}</p>
    <Field label={copy.notes} className="notes-field"><TextArea value={notes} maxLength={4000} rows={3} placeholder={copy.notesPlaceholder} onChange={e => onNotes(e.target.value)} /></Field>
  </section>;
}
