/** Organism: keeps the bid in view on small screens while the inputs are being edited. */
export function MobileBidBar({ label, price, jump }: { label: string; price: string; jump: string }) {
  return <div className="mobile-bid-bar">
    <span><span className="mobile-bid-label">{label}</span><strong>{price}</strong></span>
    <a href="#bid">{jump}</a>
  </div>;
}
