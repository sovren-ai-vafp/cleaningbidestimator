export type Part = "labor" | "supplies" | "overhead" | "profit";

/** Atom: the color key for one part of the bid. */
export function Swatch({ part }: { part: Part }) {
  return <i className={`swatch part-${part}`} aria-hidden="true" />;
}
