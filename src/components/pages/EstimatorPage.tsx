"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { content } from "@/content";
import { areaHours, defaultAreas, defaultCosts, estimate, quoteCoverage, type Area, type BidMode, type CostInputs } from "@/lib/estimator";
import { validateEstimate } from "@/lib/validation";
import { DRAFT_KEY, downloadCsv, parseDraft, type Draft } from "@/lib/draft";
import { cents, money, number } from "@/lib/format";
import { WorkspaceTemplate } from "../templates/WorkspaceTemplate";
import { TopBar } from "../organisms/TopBar";
import { EstimatorIntro } from "../organisms/EstimatorIntro";
import { BuildingPanel } from "../organisms/BuildingPanel";
import { CostsPanel } from "../organisms/CostsPanel";
import { BidSheet } from "../organisms/BidSheet";
import { MobileBidBar } from "../organisms/MobileBidBar";
import { PageFooter } from "../organisms/PageFooter";
import type { Part } from "../atoms/Swatch";
import { ExampleReset } from "../molecules/ExampleReset";
import { ModePicker } from "../organisms/ModePicker";
import { useOneOffWorkspace } from "./useOneOffWorkspace";

const modeEvent = "bid-mode-change";
const defaultMode = (): BidMode => "cleaning";

function readMode(): BidMode {
  const mode = new URLSearchParams(window.location.search).get("mode");
  return mode === "job" || mode === "project" ? mode : defaultMode();
}

function subscribeToMode(update: () => void) {
  window.addEventListener("popstate", update);
  window.addEventListener(modeEvent, update);
  return () => {
    window.removeEventListener("popstate", update);
    window.removeEventListener(modeEvent, update);
  };
}

function selectMode(mode: BidMode) {
  if (mode === readMode()) return;
  const url = new URL(window.location.href);
  url.hash = "";
  if (mode === "cleaning") url.searchParams.delete("mode");
  else url.searchParams.set("mode", mode);
  window.history.pushState(null, "", url);
  window.dispatchEvent(new Event(modeEvent));
}

export function EstimatorPage() {
  const mode = useSyncExternalStore(subscribeToMode, readMode, defaultMode);
  const cleaning = useCleaningWorkspace();
  const oneOff = useOneOffWorkspace(mode === "project" ? "project" : "job");

  return <WorkspaceTemplate
    {...(mode === "cleaning" ? cleaning : oneOff)}
    modePicker={<ModePicker mode={mode} copy={content.modes} onSelect={selectMode} />}
  />;
}

function useCleaningWorkspace() {
  const { building: b, bid, status: s, costs: costCopy, csv } = content;
  const [areas, setAreas] = useState<Area[]>(defaultAreas);
  const [costs, setCosts] = useState<CostInputs>(defaultCosts);
  const [client, setClient] = useState<string>(b.example);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<string>(s.idle);
  const [confirmReset, setConfirmReset] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);

  const result = useMemo(() => estimate(areas, costs), [areas, costs]);
  const errors = useMemo(() => validateEstimate(areas, costs), [areas, costs]);
  const sampleVisits = costs.nightsPerWeek === 3 ? defaultCosts.nightsPerWeek : 3;
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
  const updateCost = (key: keyof CostInputs, value: number) =>
    setCosts(current => ({ ...current, [key]: value }));
  const load = () => {
    let raw: string | null;
    try { raw = localStorage.getItem(DRAFT_KEY); } catch { setStatus(s.storageError); return; }
    if (!raw) { setStatus(s.noDraft); return; }
    try {
      const d = parseDraft(raw);
      setAreas(d.areas);
      setCosts(d.costs);
      setClient(d.client);
      setNotes(d.notes);
      setStatus(s.loaded);
      const { percent, margin, quote } = content.errors;
      if (validateEstimate(d.areas, d.costs).some(error => [percent, margin, quote].some(message => message === error))) {
        setPricingOpen(true);
      }
    }
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
    downloadCsv(csv.name, rows);
  };

  return {
    topBar: <TopBar brand={content.brand} links={content.links} copy={content.topBar} status={status} onSave={save} onLoad={load} />,
    intro: <EstimatorIntro copy={content.intro} sampleVisits={sampleVisits}
      onTrySchedule={() => updateCost("nightsPerWeek", sampleVisits)} />,
    worksheet: <>
      <CostsPanel copy={costCopy} costs={costs} onChange={updateCost}
        pricingOpen={pricingOpen} onTogglePricing={() => setPricingOpen(open => !open)} />
      <BuildingPanel copy={b} client={client} notes={notes} areas={areas}
        hours={area => area.sqft > 0 && area.rate > 0 ? number.format(areaHours(area)) : content.noValue}
        totalSqft={number.format(result.totalSqft)} totalHours={show(number.format(result.hoursPerVisit))}
        onClient={setClient} onNotes={setNotes} onArea={updateArea}
        onAdd={() => setAreas(current => [...current, { id: crypto.randomUUID(), label: b.newArea, sqft: 0, rate: 2000 }])}
        onRemove={id => setAreas(current => current.filter(a => a.id !== id))} />
      <ExampleReset label={costCopy.reset} confirm={costCopy.resetConfirm} cancel={costCopy.cancelReset}
        replace={costCopy.confirmReset} open={confirmReset} onOpen={() => setConfirmReset(true)}
        onCancel={() => setConfirmReset(false)} onReplace={reset} />
    </>,
    sheet: <BidSheet copy={bid} client={client} valid={valid} errors={errors} price={price}
      rates={[{ label: bid.hours, value: show(number.format(result.hoursPerVisit)) }, { label: bid.perVisit, value: show(money.format(result.pricePerVisit)) }]}
      parts={parts} quote={hasQuote ? { amount: result.quickPrice, display: money.format(result.quickPrice) } : undefined}
      verdict={verdict} coverage={coverage}
      stats={[
        { label: bid.perSqft, value: show(cents.format(result.pricePerSqft)) },
        { label: bid.crew, value: show(String(result.cleanersPerNight)) },
        { label: bid.visits, value: show(number.format(result.visitsPerMonth)) },
        { label: bid.annual, value: show(money.format(result.annualPrice)) },
      ]}
      onPrint={() => window.print()} onExport={exportCsv} />,
    footer: <PageFooter method={content.method} footer={content.footer} links={content.links} project={content.topBar} />,
    mobileBar: <MobileBidBar label={bid.mobileHeading} price={price} jump={bid.jump} />,
  };
}
