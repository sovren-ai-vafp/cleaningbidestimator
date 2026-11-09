"use client";

import { useMemo, useState } from "react";
import { content } from "@/content";
import { areaHours, defaultAreas, defaultCosts, estimate, quoteCoverage, type Area, type CostInputs } from "@/lib/estimator";
import { validateEstimate } from "@/lib/validation";
import { DRAFT_KEY, makeCsv, parseDraft, type Draft } from "@/lib/draft";
import { cents, money, number } from "@/lib/format";
import { WorkspaceTemplate } from "../templates/WorkspaceTemplate";
import { TopBar } from "../organisms/TopBar";
import { BuildingPanel } from "../organisms/BuildingPanel";
import { CostsPanel } from "../organisms/CostsPanel";
import { BidSheet } from "../organisms/BidSheet";
import { MobileBidBar } from "../organisms/MobileBidBar";
import { PageFooter } from "../organisms/PageFooter";
import type { Part } from "../atoms/Swatch";

/** Page: holds the estimate state and fills the workspace template with real content. */
export function EstimatorPage() {
  const { building: b, bid, status: s, costs: costCopy, csv } = content;
  const [areas, setAreas] = useState<Area[]>(defaultAreas);
  const [costs, setCosts] = useState<CostInputs>(defaultCosts);
  const [client, setClient] = useState<string>(b.example);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<string>(s.idle);
  const [confirmReset, setConfirmReset] = useState(false);

  const result = useMemo(() => estimate(areas, costs), [areas, costs]);
  const errors = useMemo(() => validateEstimate(areas, costs), [areas, costs]);
  const valid = errors.length === 0;
  const show = (text: string) => valid ? text : content.noValue;
  const price = show(money.format(result.monthlyPrice));

  const parts: { part: Part; label: string; amount: number; display: string }[] = [
    { part: "labor", label: bid.labor, amount: result.laborCost, display: money.format(result.laborCost) },
    { part: "supplies", label: bid.supplies, amount: result.suppliesCost, display: money.format(result.suppliesCost) },
    { part: "overhead", label: bid.overhead, amount: result.overheadCost, display: money.format(result.overheadCost) },
    { part: "profit", label: bid.profit, amount: result.profit, display: money.format(result.profit) },
  ];
  const gap = Math.round(result.gapPerMonth);
  const hasQuote = result.quickPrice > 0;
  const verdict = !hasQuote ? "" : gap > 0 ? bid.quoteUnder(money.format(gap)) : gap < 0 ? bid.quoteOver(money.format(-gap)) : bid.quoteEqual;
  const coverage = bid.coverage[quoteCoverage(result)] + (hasQuote ? ` ${bid.marginAtQuote}: ${number.format(result.quickMarginPct)}%.` : "");

  const save = () => {
    const draft: Draft = { version: 1, client, notes, areas, costs };
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); setStatus(s.saved); }
    catch { setStatus(s.storageError); }
  };
  const load = () => {
    let raw: string | null;
    try { raw = localStorage.getItem(DRAFT_KEY); } catch { setStatus(s.storageError); return; }
    if (!raw) { setStatus(s.noDraft); return; }
    try { const d = parseDraft(raw); setAreas(d.areas); setCosts(d.costs); setClient(d.client); setNotes(d.notes); setStatus(s.loaded); }
    catch { setStatus(s.invalidDraft); }
  };
  const reset = () => { setAreas(defaultAreas); setCosts(defaultCosts); setClient(b.example); setNotes(""); setStatus(s.idle); setConfirmReset(false); };
  const updateArea = (id: string, field: "label" | "sqft" | "rate", value: string) =>
    setAreas(current => current.map(a => a.id !== id ? a : field === "label" ? { ...a, label: value } : { ...a, [field]: value === "" ? 0 : Number(value) }));
  const exportCsv = () => {
    if (!valid) return;
    const keys = Object.keys(costCopy.fields) as (keyof CostInputs)[];
    const rows: (string | number)[][] = [
      [csv.client, client], [csv.scope, notes], [],
      [b.areaCol, csv.sqft, csv.rate, csv.hours], ...areas.map(a => [a.label, a.sqft, a.rate, areaHours(a)]), [],
      ...keys.map(key => [costCopy.fields[key], costs[key]]), [],
      [csv.metric, csv.value], ...parts.map(p => [p.label, p.amount]),
      [csv.totalCost, result.monthlyCost], [csv.monthly, result.monthlyPrice], [bid.annual, result.annualPrice],
      [bid.perVisit, result.pricePerVisit], [bid.visits, result.visitsPerMonth], [csv.monthlyHours, result.monthlyHours],
      [bid.crew, result.cleanersPerNight], [csv.quickPrice, result.quickPrice], [bid.marginAtQuote, result.quickMarginPct],
      [csv.assumptions, b.assumption], [content.method.heading, content.method.body], [bid.fine],
    ];
    const url = URL.createObjectURL(new Blob([makeCsv(rows)], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a"); link.href = url; link.download = csv.name; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return <WorkspaceTemplate
    topBar={<TopBar brand={content.brand} links={content.links} copy={content.topBar} status={status} onSave={save} onLoad={load} />}
    intro={content.intro}
    worksheet={<>
      <BuildingPanel copy={b} client={client} notes={notes} areas={areas}
        hours={area => area.sqft > 0 && area.rate > 0 ? number.format(areaHours(area)) : content.noValue}
        totalSqft={number.format(result.totalSqft)} totalHours={show(number.format(result.hoursPerVisit))}
        onClient={setClient} onNotes={setNotes} onArea={updateArea}
        onAdd={() => setAreas(current => [...current, { id: crypto.randomUUID(), label: b.newArea, sqft: 0, rate: 2000 }])}
        onRemove={id => setAreas(current => current.filter(a => a.id !== id))} />
      <CostsPanel copy={costCopy} costs={costs} onChange={(key, value) => setCosts(current => ({ ...current, [key]: value }))}
        confirmReset={confirmReset} onAskReset={() => setConfirmReset(true)} onCancelReset={() => setConfirmReset(false)} onReset={reset} />
    </>}
    sheet={<BidSheet copy={bid} client={client} valid={valid} errors={errors} price={price}
      rates={[{ label: bid.perSqft, value: show(cents.format(result.pricePerSqft)) }, { label: bid.perVisit, value: show(money.format(result.pricePerVisit)) }]}
      parts={parts} quote={hasQuote ? { amount: result.quickPrice, display: money.format(result.quickPrice) } : undefined}
      verdict={verdict} coverage={coverage}
      stats={[
        { label: bid.hours, value: show(number.format(result.hoursPerVisit)) },
        { label: bid.crew, value: show(String(result.cleanersPerNight)) },
        { label: bid.visits, value: show(number.format(result.visitsPerMonth)) },
        { label: bid.annual, value: show(money.format(result.annualPrice)) },
      ]}
      onPrint={() => window.print()} onExport={exportCsv} />}
    footer={<PageFooter method={content.method} footer={content.footer} home={content.links.home} />}
    mobileBar={<MobileBidBar label={bid.heading} price={price} jump={bid.jump} />}
  />;
}
