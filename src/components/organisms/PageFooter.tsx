import { TextLink } from "../atoms/TextLink";
import type { Content } from "@/content";

/** Organism: method note and the link back to Sovren. */
export function PageFooter({ method, footer, home }: { method: Content["method"]; footer: Content["footer"]; home: string }) {
  return <footer className="page-footer">
    <details className="method"><summary>{method.heading}</summary><p>{method.body}</p></details>
    <div className="footer-line"><span>{footer.builtBy}</span><TextLink href={home} external>{footer.cta}</TextLink></div>
  </footer>;
}
