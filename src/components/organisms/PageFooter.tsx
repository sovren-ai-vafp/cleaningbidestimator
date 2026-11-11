import { TextLink } from "../atoms/TextLink";
import type { Content } from "@/content";

/** Organism: method note and the link back to Sovren. */
export function PageFooter({ method, footer, links, project }: {
  method: { heading: string; body: string }; footer: Content["footer"]; links: Content["links"]; project: Content["topBar"];
}) {
  return <footer className="page-footer">
    <section id="adapt" className="adapt" aria-labelledby="adapt-heading" tabIndex={-1}>
      <h2 id="adapt-heading">{footer.heading}</h2>
      <p>{footer.body}</p>
      <dl>
        {footer.examples.map(example => <div key={example.service}>
          <dt>{example.service}</dt>
          <dd>{example.inputs}</dd>
        </div>)}
      </dl>
      <TextLink href={links.home} external>{footer.cta}</TextLink>
    </section>
    <details className="method"><summary>{method.heading}</summary><p>{method.body}</p></details>
    <div className="footer-line">
      <span>{footer.builtBy}</span>
      <div className="footer-links">
        <TextLink href={links.caseStudy} external>{project.caseStudy}</TextLink>
        <TextLink href={links.code} external>{project.code}</TextLink>
      </div>
    </div>
  </footer>;
}
