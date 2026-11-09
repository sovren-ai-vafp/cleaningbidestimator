import { Swatch, type Part } from "../atoms/Swatch";

type PriceBuildProps = {
  label: string;
  parts: { part: Part; label: string; amount: number; display: string }[];
  /** The owner's usual monthly quote, drawn as a marker on the same scale. */
  quote?: { amount: number; label: string; display: string };
};

/**
 * Molecule: labor, supplies, overhead and profit stacked into the bid, with the usual quote
 * marked on the same scale so you can see which costs it leaves uncovered.
 */
export function PriceBuild({ label, parts, quote }: PriceBuildProps) {
  const total = parts.reduce((sum, p) => sum + Math.max(0, p.amount), 0);
  const scale = Math.max(total, quote?.amount ?? 0) || 1;
  const marker = quote && quote.amount > 0 ? Math.min(100, (quote.amount / scale) * 100) : null;
  return <figure className="price-build" aria-label={label}>
    <figcaption className="price-build-label">{label}</figcaption>
    <div className="price-build-track" aria-hidden="true">
      {parts.map(p => <span key={p.part} className={`price-build-part part-${p.part}`} style={{ width: `${(Math.max(0, p.amount) / scale) * 100}%` }} />)}
      {marker !== null ? <span className="price-build-marker" style={{ left: `${marker}%` }}><span className={`price-build-marker-label${marker > 60 ? " is-right" : ""}`}>{quote!.label} {quote!.display}</span></span> : null}
    </div>
    <ul className="price-build-legend">
      {parts.map(p => <li key={p.part}><Swatch part={p.part} /><span>{p.label}</span><strong>{p.display}</strong></li>)}
    </ul>
  </figure>;
}
