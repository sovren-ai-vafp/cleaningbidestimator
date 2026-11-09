import type { ReactNode } from "react";

type FieldProps = { label: string; hideLabel?: boolean; className?: string; children: ReactNode };

/** Molecule: a visible label wrapped around one input. */
export function Field({ label, hideLabel = false, className = "", children }: FieldProps) {
  return <label className={`field ${className}`.trim()}>
    <span className={hideLabel ? "sr-only" : "field-label"}>{label}</span>
    {children}
  </label>;
}
