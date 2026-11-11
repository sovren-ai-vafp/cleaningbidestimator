import type { MouseEvent } from "react";
import type { Content } from "@/content";
import type { BidMode } from "@/lib/estimator";

const modes: BidMode[] = ["cleaning", "job", "project"];

export function ModePicker({ mode, copy, onSelect }: {
  mode: BidMode;
  copy: Content["modes"];
  onSelect: (mode: BidMode) => void;
}) {
  function select(event: MouseEvent<HTMLAnchorElement>, next: BidMode) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onSelect(next);
  }

  return <nav className="mode-picker" aria-label={copy.label}>
    {modes.map(option => <a key={option} href={option === "cleaning" ? "/" : `/?mode=${option}`}
      className="btn btn-quiet" aria-current={option === mode ? "page" : undefined} onClick={event => select(event, option)}>
      {copy[option]}
    </a>)}
  </nav>;
}
