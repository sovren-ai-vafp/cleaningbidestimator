import type { ReactNode } from "react";

type WorkspaceTemplateProps = {
  topBar: ReactNode;
  intro: { heading: string; body: string; privacy: string };
  worksheet: ReactNode;
  sheet: ReactNode;
  footer: ReactNode;
  mobileBar: ReactNode;
};

/** Template: inputs on the left, the bid pinned on the right. On phones the bid follows the inputs. */
export function WorkspaceTemplate({ topBar, intro, worksheet, sheet, footer, mobileBar }: WorkspaceTemplateProps) {
  return <div className="app">
    {topBar}
    <main id="estimator" tabIndex={-1}>
      <div className="intro">
        <h1>{intro.heading}</h1>
        <p>{intro.body} {intro.privacy}</p>
      </div>
      <div className="workspace">
        <div className="worksheet">{worksheet}</div>
        <div className="sheet-column">{sheet}</div>
      </div>
    </main>
    {footer}
    {mobileBar}
  </div>;
}
