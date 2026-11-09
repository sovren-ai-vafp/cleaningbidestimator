/** Molecule: label and value pairs. */
export function StatList({ items, className = "" }: { items: { label: string; value: string }[]; className?: string }) {
  return <dl className={`stat-list ${className}`.trim()}>{items.map(item => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl>;
}
