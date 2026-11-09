import { Input } from "../atoms/Input";
import { Field } from "./Field";

type NumberFieldProps = { label: string; value: number; onChange: (value: number) => void; min?: number; max?: number; step?: number };

/** Molecule: a labeled number input. An empty input reads as 0 so validation can flag it. */
export function NumberField({ label, value, onChange, min = 0, max, step = 1 }: NumberFieldProps) {
  return <Field label={label}>
    <Input type="number" min={min} max={max} step={step} value={value} onChange={e => onChange(e.target.value === "" ? 0 : Number(e.target.value))} />
  </Field>;
}
