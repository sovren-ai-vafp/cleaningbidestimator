"use client";

import { useMemo, useState } from "react";
import { content, workspace as w } from "@/content";
import { defaultAreas, defaultCosts, estimate, areaHours, type Area, type CostInputs } from "@/lib/estimator";
import { validateEstimate } from "@/lib/validation";
import { DRAFT_KEY, makeCsv, parseDraft, type Draft } from "@/lib/draft";

const c = content.estimator;
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const cents = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 3 });
const num = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const fields: { key: keyof CostInputs; step: number; max: number }[] = [
  { key: "nightsPerWeek", step: 1, max: 7 }, { key: "shiftHours", step: 0.5, max: 24 },
  { key: "wage", step: 0.25, max: 10000 }, { key: "burdenPct", step: 1, max: 100 },
  { key: "suppliesPct", step: 1, max: 100 }, { key: "overheadPct", step: 1, max: 100 },
  { key: "marginPct", step: 1, max: 90 }, { key: "quickRate", step: 0.01, max: 10000 },
];

export function Estimator() {
  const [areas, setAreas] = useState<Area[]>(defaultAreas);
  const [costs, setCosts] = useState<CostInputs>(defaultCosts);
  const [client, setClient] = useState<string>(w.example);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const result = useMemo(() => estimate(areas, costs), [areas, costs]);
  const errors = useMemo(() => validateEstimate(areas, costs), [areas, costs]);
  const valid = errors.length === 0;
  const price = (value: number) => valid ? money.format(value) : "—";
  const breakdown = [
    { label: w.labor, value: result.laborCost, className: "labor" },
    { label: w.supplies, value: result.suppliesCost, className: "supplies" },
    { label: w.overhead, value: result.overheadCost, className: "overhead" },
    { label: w.profit, value: result.profit, className: "profit" },
  ];
  const draft = (): Draft => ({ version: 1, client, notes, areas, costs });
  const save = () => {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(draft())); setStatus(w.saved); }
    catch { setStatus(w.storageError); }
  };
  const load = () => {
    let raw: string | null;
    try { raw = localStorage.getItem(DRAFT_KEY); } catch { setStatus(w.storageError); return; }
    if (!raw) { setStatus(w.noDraft); return; }
    try {
      const d = parseDraft(raw);
      setAreas(d.areas); setCosts(d.costs); setClient(d.client); setNotes(d.notes); setStatus(w.loaded);
    } catch { setStatus(w.invalidDraft); }
  };
  const reset = () => {
    setAreas(defaultAreas); setCosts(defaultCosts); setClient(w.example); setNotes(""); setStatus(""); setConfirmReset(false);
  };
  const updateArea = (id: string, field: "sqft" | "rate", value: string) =>
    setAreas(current => current.map(area => area.id === id ? { ...area, [field]: value === "" ? 0 : Number(value) } : area));
  const exportCsv = () => {
    if (!valid) return;
    const rows: (string | number)[][] = [
      [w.csvClient, client], [w.csvScope, notes], [],
      [c.areaCol, w.csvSqft, w.csvRate, w.csvHours],
      ...areas.map(a => [a.label, a.sqft, a.rate, areaHours(a)]), [],
      ...fields.map(({ key }) => [c.fields[key], costs[key]]), [],
      [w.csvMetric, w.csvValue], ...breakdown.map(b => [b.label, b.value]),
      [w.totalCost, result.monthlyCost], [w.total, result.monthlyPrice], [w.annual, result.annualPrice],
      [w.perVisit, result.pricePerVisit], [w.visits, result.visitsPerMonth],
      [c.results.monthlyHours, result.monthlyHours], [w.crew, result.cleanersPerNight],
      [c.quickPrice, result.quickPrice], [c.quickMargin, result.quickMarginPct],
      [w.csvAssumptions, w.assumptions], [w.method, w.methodText], [w.estimateOnly],
    ];
    const url = URL.createObjectURL(new Blob([makeCsv(rows)], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a"); a.href = url; a.download = w.csvName; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return <div className="workspace">
    <a className="skip-link" href="#overview">{w.skip}</a>
    <aside className="sidebar glass">
      <a className="brand" href={content.links.home} aria-label={content.brand}>
        {/* eslint-disable-next-line @next/next/no-img-element -- local vector wordmark */}
        <img src="/brand/sovren-logo-navy.svg" alt={content.brand} width="150" height="24" />
      </a>
      <span className="workspace-label">{w.app}</span>
      <nav aria-label={w.navigation}>
        <a href="#overview"><span aria-hidden="true">◫</span>{w.overview}</a>
        <a href="#building"><span aria-hidden="true">▦</span>{w.building}</a>
        <a href="#costs"><span aria-hidden="true">◎</span>{w.costs}</a>
        <a href="#summary"><span aria-hidden="true">↗</span>{w.summary}</a>
      </nav>
      <div className="sidebar-bottom"><p>{w.private}</p><a href={content.links.caseStudy}>{content.header.caseStudy}<span aria-hidden="true"> ↗</span></a><a href={content.links.code}>{content.header.code}<span aria-hidden="true"> ↗</span></a><span className="project-tag">{w.project}</span></div>
    </aside>
    <main id="overview" className="dashboard">
      <header className="dashboard-header">
        <div><p className="eyebrow">{content.brand} / {w.app}</p><h1>{w.title}</h1><p className="intro">{w.intro}</p></div>
        <div className="header-actions"><button onClick={load}>{w.load}</button><button className="primary" onClick={save}>{w.save}<span aria-hidden="true"> ↗</span></button></div>
      </header>
      <p className="status" role="status">{status || w.draftNote}</p>
      <section className="metrics" aria-label={w.overview}>
        <div className="metric glass"><span className="metric-icon" aria-hidden="true">▦</span><span>{w.areaSize}</span><strong>{num.format(result.totalSqft)}</strong><small>{num.format(areas.filter(a => a.sqft > 0).length)} {w.areaCount.toLowerCase()}</small></div>
        <div className="metric glass"><span className="metric-icon" aria-hidden="true">◷</span><span>{w.hours}</span><strong>{valid ? num.format(result.hoursPerVisit) : "—"}</strong><small>{valid ? num.format(result.monthlyHours) : "—"} {c.results.monthlyHours.toLowerCase()}</small></div>
        <div className="metric featured"><span className="metric-icon" aria-hidden="true">↗</span><span>{w.monthly}</span><strong>{price(result.monthlyPrice)}</strong><small>{valid ? `${num.format(costs.marginPct)}% ${w.atMargin}` : w.pending}</small></div>
        <div className="metric glass"><span className="metric-icon" aria-hidden="true">♙</span><span>{w.crew}</span><strong>{valid ? result.cleanersPerNight : "—"}</strong><small>{w.shift}</small></div>
      </section>
      <div className="editor-grid">
        <div className="input-panels">
          <section id="building" className="panel glass">
            <div className="panel-heading"><div><p className="eyebrow">01 / {w.building}</p><h2>{c.areasHeading}</h2></div><button className="subtle" onClick={() => setAreas(current => [...current, { id: crypto.randomUUID(), label: w.newArea, sqft: 0, rate: 2000 }])} disabled={areas.length >= 100}><span aria-hidden="true">＋ </span>{w.addArea}</button></div>
            <p className="section-intro">{w.scopeIntro}</p>
            <label className="field client-field"><span>{w.client}</span><input value={client} maxLength={160} onChange={e => setClient(e.target.value)} /></label>
            <div className="area-head" aria-hidden="true"><span>{c.areaCol}</span><span>{c.sqftCol}</span><span>{c.rateCol}</span><span /></div>
            <div className="area-list">{areas.map(area => <div className="area-row" key={area.id}>
              <label className="field area-name"><span className="sr-only">{w.areaName}</span><input value={area.label} maxLength={100} onChange={e => setAreas(current => current.map(a => a.id === area.id ? { ...a, label: e.target.value } : a))} /></label>
              <label className="field"><span className="mobile-label">{c.sqftCol}</span><input type="number" min="0" max="100000000" step="any" inputMode="decimal" aria-label={`${area.label}, ${c.sqftCol}`} value={area.sqft} onChange={e => updateArea(area.id, "sqft", e.target.value)} /></label>
              <label className="field"><span className="mobile-label">{c.rateCol}</span><input type="number" min={area.sqft > 0 ? "0.01" : "0"} max="100000000" step="any" inputMode="decimal" aria-label={`${area.label}, ${c.rateCol}`} value={area.rate} onChange={e => updateArea(area.id, "rate", e.target.value)} /></label>
              <button className="icon-button" aria-label={`${w.remove}: ${area.label}`} onClick={() => setAreas(current => current.filter(a => a.id !== area.id))}>×</button>
            </div>)}</div>
            {areas.length === 0 && <p className="section-intro">{w.empty}</p>}
            <p className="assumption">ⓘ {w.assumptions}</p>
            <label className="field notes-field"><span>{w.notes}</span><textarea value={notes} maxLength={4000} rows={3} placeholder={w.notesPlaceholder} onChange={e => setNotes(e.target.value)} /></label>
          </section>
          <section id="costs" className="panel glass">
            <div className="panel-heading"><div><p className="eyebrow">02 / {w.costs}</p><h2>{c.costsHeading}</h2></div></div>
            <div className="cost-fields">{fields.map(({ key, step, max }) => <label key={key} className="field"><span>{c.fields[key]}</span><input type="number" min={key === "nightsPerWeek" ? 1 : 0} max={max} step={step} inputMode="decimal" value={costs[key]} onChange={e => setCosts(current => ({ ...current, [key]: e.target.value === "" ? 0 : Number(e.target.value) }))} /></label>)}</div>
            <p className="assumption">{c.footnote}</p>
            {confirmReset ? <div className="reset-confirm" role="group" aria-label={w.reset}><p>{w.resetConfirm}</p><div><button onClick={() => setConfirmReset(false)}>{w.cancelReset}</button><button onClick={reset}>{w.confirmReset}</button></div></div> : <button className="text-button" onClick={() => setConfirmReset(true)}>{w.reset}</button>}
          </section>
        </div>
        <aside id="summary" className="summary-column">
          <section className="panel glass bid-summary" aria-labelledby="bid-heading">
            <div className="panel-heading"><div><p className="eyebrow">03 / {w.summary}</p><h2 id="bid-heading">{c.resultsHeading}</h2></div><span className="live-badge"><i />{w.live}</span></div>
            <p className="bid-client">{client}</p><p className="bid-price" aria-live="polite" aria-atomic="true">{price(result.monthlyPrice)}<span>{c.perMonth}</span></p>
            <p className="section-intro">{c.results.monthlyPrice}</p>
            {!valid && <div className="validation" role="alert"><p>{w.validation}</p><ul>{errors.map(error => <li key={error}>{error}</li>)}</ul></div>}
            <dl className="stats"><div><dt>{c.results.pricePerSqft}</dt><dd>{valid ? cents.format(result.pricePerSqft) : "—"}</dd></div><div><dt>{w.perVisit}</dt><dd>{price(result.pricePerVisit)}</dd></div><div><dt>{w.visits}</dt><dd>{valid ? num.format(result.visitsPerMonth) : "—"}</dd></div><div><dt>{w.annual}</dt><dd>{price(result.annualPrice)}</dd></div></dl>
            <div className="export-actions"><button className="primary" disabled={!valid} onClick={() => window.print()}>{w.print}<span aria-hidden="true"> ↗</span></button><button disabled={!valid} onClick={exportCsv}>{w.export}</button></div>
            <p className="fine-print">{w.estimateOnly}</p>
          </section>
          <section className="panel glass">
            <h2>{w.breakdown}</h2><p className="section-intro">{w.breakdownIntro}</p>
            <div className="cost-bar" aria-hidden="true">{breakdown.map(b => <span className={b.className} key={b.label} style={{ flex: valid ? b.value : 1 }} />)}</div>
            <dl className="stats breakdown">{breakdown.map(b => <div key={b.label}><dt><i className={b.className} />{b.label}</dt><dd>{price(b.value)}</dd></div>)}<div className="total"><dt>{w.totalCost}</dt><dd>{price(result.monthlyCost)}</dd></div></dl>
          </section>
          <section className="panel glass comparison"><h2>{w.comparison}</h2><p className="section-intro">{w.comparisonIntro}</p>
            {costs.quickRate > 0 ? <><dl className="stats"><div><dt>{c.quickPrice}</dt><dd>{price(result.quickPrice)}</dd></div><div><dt>{c.quickMargin}</dt><dd>{valid ? `${num.format(result.quickMarginPct)}%` : "—"}</dd></div></dl><div className="gap"><span>{result.gapPerMonth > 0 ? w.under : result.gapPerMonth < 0 ? w.over : w.equal}</span><strong>{price(Math.abs(result.gapPerMonth))}</strong></div></> : <p className="assumption">{w.noQuote}</p>}
          </section>
        </aside>
      </div>
      <details className="method glass"><summary>{w.method}</summary><p>{w.methodText}</p></details>
      <footer className="dashboard-footer"><span>{content.footer.builtBy}</span><a href={content.links.home}>{content.footer.ctaLink}<span aria-hidden="true"> ↗</span></a></footer>
    </main>
  </div>;
}
