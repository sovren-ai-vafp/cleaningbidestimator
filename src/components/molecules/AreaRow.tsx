import { Input } from "../atoms/Input";

type AreaRowProps = {
  label: string; sqft: number; rate: number; hours: string;
  labels: { areaName: string; sqftCol: string; rateCol: string; hoursCol: string; remove: string };
  onChange: (field: "label" | "sqft" | "rate", value: string) => void;
  onRemove: () => void;
};

/** Molecule: one area of the building with its live labor hours. */
export function AreaRow({ label, sqft, rate, hours, labels, onChange, onRemove }: AreaRowProps) {
  const unused = !(sqft > 0);
  return <div className={`area-row${unused ? " is-unused" : ""}`}>
    <label className="area-cell area-name"><span className="sr-only">{labels.areaName}</span>
      <Input value={label} maxLength={100} onChange={e => onChange("label", e.target.value)} /></label>
    <label className="area-cell"><span className="area-mobile-label">{labels.sqftCol}</span>
      <Input type="number" min={0} max={1e8} step="any" aria-label={`${label}, ${labels.sqftCol}`} value={sqft} onChange={e => onChange("sqft", e.target.value)} /></label>
    <label className="area-cell"><span className="area-mobile-label">{labels.rateCol}</span>
      <Input type="number" min={sqft > 0 ? 0.01 : 0} max={1e8} step="any" aria-label={`${label}, ${labels.rateCol}`} value={rate} onChange={e => onChange("rate", e.target.value)} /></label>
    <span className="area-cell area-hours"><span className="area-mobile-label">{labels.hoursCol}</span><output aria-label={`${label}, ${labels.hoursCol}`}>{hours}</output></span>
    <span className="area-cell area-remove"><button type="button" className="remove-button" aria-label={`${labels.remove} ${label}`} onClick={onRemove}><span aria-hidden="true">×</span></button></span>
  </div>;
}
