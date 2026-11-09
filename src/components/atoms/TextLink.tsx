import type { ReactNode } from "react";

/** Atom: navigation link. External links open in a new tab. */
export function TextLink({ href, children, external = false }: { href: string; children: ReactNode; external?: boolean }) {
  return <a className="text-link" href={href} target={external ? "_blank" : undefined} rel={external ? "noopener" : undefined}>{children}</a>;
}
