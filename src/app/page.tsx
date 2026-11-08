import { Estimator } from "@/components/Estimator";
import { content } from "@/content";

export default function Home() {
  const { hero, links, header, footer } = content;
  return <>
    <header className="container tool-header">
      <a href={links.home} aria-label={content.brand}>
        {/* eslint-disable-next-line @next/next/no-img-element -- static SVG logo, no optimization needed */}
        <img src="/brand/sovren-logo-navy.svg" alt={content.brand} width={1610} height={255} />
      </a>
      <nav aria-label={content.brand}>
        <a className="text-link" href={links.caseStudy}>{header.caseStudy}<span aria-hidden="true">↗</span></a>
        <a className="text-link" href={links.code}>{header.code}<span aria-hidden="true">↗</span></a>
      </nav>
    </header>
    <main className="container tool-main">
      <section className="tool-hero" aria-labelledby="tool-heading">
        <p className="eyebrow">{hero.eyebrow}</p>
        <h1 id="tool-heading">{hero.heading}</h1>
        <p className="tool-intro">{hero.intro}</p>
        <p className="tool-note">{hero.note}</p>
      </section>
      <Estimator />
    </main>
    <footer className="tool-footer">
      <div className="container">
        <p>{footer.builtBy} {footer.cta}</p>
        <a href={links.home}>{footer.ctaLink}</a>
      </div>
    </footer>
  </>;
}
