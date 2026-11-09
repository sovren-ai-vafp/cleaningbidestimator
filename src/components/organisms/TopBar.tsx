import { Logo } from "../atoms/Logo";
import { TextLink } from "../atoms/TextLink";
import { Button } from "../atoms/Button";
import type { Content } from "@/content";

type TopBarProps = { brand: string; links: Content["links"]; copy: Content["topBar"]; status: string; onSave: () => void; onLoad: () => void };

/** Organism: brand, project links, draft actions and the save status line. */
export function TopBar({ brand, links, copy, status, onSave, onLoad }: TopBarProps) {
  return <header className="top-bar">
    <a className="skip-link" href="#estimator">{copy.skip}</a>
    <Logo href={links.home} alt={brand} />
    <nav className="top-links" aria-label={brand}>
      <TextLink href={links.caseStudy} external>{copy.caseStudy}</TextLink>
      <TextLink href={links.code} external>{copy.code}</TextLink>
    </nav>
    <div className="draft-actions">
      <Button onClick={onLoad}>{copy.load}</Button>
      <Button variant="solid" onClick={onSave}>{copy.save}</Button>
    </div>
    <p className="status" role="status">{status}</p>
  </header>;
}
