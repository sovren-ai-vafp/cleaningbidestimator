import { Button } from "../atoms/Button";
import { PriceBuild } from "../molecules/PriceBuild";
import { StatList } from "../molecules/StatList";
import { Notice } from "../molecules/Notice";
import type { Part } from "../atoms/Swatch";
import type { Content } from "@/content";

type BidSheetProps = {
  copy: Record<keyof Pick<Content["bid"], "heading" | "priceUnit" | "validation" | "buildLabel" | "quoteMarker" | "print" | "export" | "fine">, string>;
  client: string;
  valid: boolean; errors: string[];
  price: string;
  rates: { label: string; value: string }[];
  parts: { part: Part; label: string; amount: number; display: string }[];
  quote?: { amount: number; display: string };
  verdict?: string; coverage?: string;
  stats?: { label: string; value: string }[];
  onPrint: () => void; onExport: () => void;
};

/** Organism: the live bid. The one dark, high-emphasis surface on the page. */
export function BidSheet({ copy, client, valid, errors, price, rates, parts, quote, verdict, coverage, stats, onPrint, onExport }: BidSheetProps) {
  return <section id="bid" className="bid-sheet" aria-labelledby="bid-heading" tabIndex={-1}>
    <p className="bid-client">{client}</p>
    <h2 id="bid-heading" className="bid-label">{copy.heading}</h2>
    <p className="bid-price" aria-live="polite" aria-atomic="true">{price}{valid ? <span>{copy.priceUnit}</span> : null}</p>
    {valid ? <StatList className="bid-rates" items={rates} /> : <Notice tone="alert"><p>{copy.validation}</p><ul>{errors.map(e => <li key={e}>{e}</li>)}</ul></Notice>}
    {valid ? <PriceBuild label={copy.buildLabel} parts={parts} quote={quote ? { ...quote, label: copy.quoteMarker } : undefined} /> : null}
    {valid && coverage ? <div className="bid-verdict">{verdict ? <p className="bid-verdict-gap">{verdict}</p> : null}<p>{coverage}</p></div> : null}
    {stats ? <StatList className="bid-stats" items={stats} /> : null}
    <div className="bid-actions">
      <Button variant="onDark" disabled={!valid} onClick={onPrint}>{copy.print}</Button>
      <Button variant="link" className="on-dark-link" disabled={!valid} onClick={onExport}>{copy.export}</Button>
    </div>
    <p className="bid-fine">{copy.fine}</p>
  </section>;
}
