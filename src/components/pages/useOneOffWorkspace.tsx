import { useState } from "react";
import { content } from "@/content";
import { defaultJob, defaultProject, estimateOneOff, type OneOffBid, type OneOffMode } from "@/lib/estimator";
import { downloadCsv, oneOffDraftKey, parseOneOffDraft } from "@/lib/draft";
import { number, preciseMoney } from "@/lib/format";
import { oneOffLimits, validateOneOff } from "@/lib/validation";
import { Input, TextArea } from "../atoms/Input";
import type { Part } from "../atoms/Swatch";
import { ExampleReset } from "../molecules/ExampleReset";
import { Field } from "../molecules/Field";
import { NumberField } from "../molecules/NumberField";
import { BidSheet } from "../organisms/BidSheet";
import { MobileBidBar } from "../organisms/MobileBidBar";
import { PageFooter } from "../organisms/PageFooter";
import { ProjectStages } from "../organisms/ProjectStages";
import { TopBar } from "../organisms/TopBar";

const examples = { job: defaultJob, project: defaultProject };
const jobFields = ["workers", "onSiteHours", "travelHours", "materials", "expenses"] as const;
const pricingFields = ["wage", "overheadPct", "marginPct"] as const;

export function useOneOffWorkspace(mode: OneOffMode) {
  const { oneOff: copy, bid: bidCopy, status, csv, costs } = content;
  const selected = copy[mode];
  const [bids, setBids] = useState<Record<OneOffMode, OneOffBid>>(examples);
  const [messages, setMessages] = useState<Record<OneOffMode, string>>({ job: status.idle, project: status.idle });
  const [confirmReset, setConfirmReset] = useState<OneOffMode | null>(null);
  const bid = bids[mode];
  const result = estimateOneOff(bid);
  const errors = validateOneOff(bid);
  const valid = errors.length === 0;
  const price = valid ? preciseMoney.format(result.price) : content.noValue;
  const method = { heading: content.method.heading, body: `${selected.method} ${copy.method}` };

  const partValues = [
    { part: "labor", label: bidCopy.labor, amount: result.laborCost },
    { part: "supplies", label: copy.directCosts, amount: result.directCosts },
    { part: "overhead", label: bidCopy.overhead, amount: result.overheadCost },
    { part: "profit", label: bidCopy.profit, amount: result.profit },
  ] satisfies { part: Part; label: string; amount: number }[];
  const parts = partValues.map(part => ({ ...part, display: preciseMoney.format(part.amount) }));

  function updateBid(next: OneOffBid) {
    setBids(current => ({ ...current, [next.mode]: next }));
  }

  function setMessage(message: string) {
    setMessages(current => ({ ...current, [mode]: message }));
  }

  function save() {
    try {
      localStorage.setItem(oneOffDraftKey(mode), JSON.stringify({ version: 1, bid }));
      setMessage(status.saved);
    } catch {
      setMessage(status.storageError);
    }
  }

  function load() {
    let raw: string | null;
    try { raw = localStorage.getItem(oneOffDraftKey(mode)); } catch { setMessage(status.storageError); return; }
    if (!raw) { setMessage(status.noDraft); return; }
    try {
      updateBid(parseOneOffDraft(raw, mode));
      setMessage(status.loaded);
    } catch {
      setMessage(status.invalidDraft);
    }
  }

  function reset() {
    updateBid(examples[mode]);
    setMessage(status.idle);
    setConfirmReset(null);
  }

  function exportCsv() {
    if (!valid) return;
    const scopeRows = bid.mode === "job" ? jobFields.map(key => [copy.job.fields[key], bid[key]]) : [
      [copy.project.stage, copy.project.stageHours, copy.project.stageMaterials],
      ...bid.stages.map(stage => [stage.label, stage.hours, stage.materials]),
      [copy.project.expenses, bid.expenses],
    ];
    downloadCsv(selected.filename, [
      [selected.client, bid.client], [csv.scope, bid.notes], [],
      ...scopeRows, [],
      ...pricingFields.map(key => [copy[key], bid[key]]), [],
      [csv.metric, csv.value], [copy.hours, result.hours],
      ...parts.map(part => [part.label, part.amount]),
      [copy.totalCost, result.totalCost], [selected.price, result.price],
      [method.heading, method.body], [copy.fine],
    ]);
  }

  return {
    topBar: <TopBar brand={content.brand} links={content.links} copy={content.topBar} status={messages[mode]} onSave={save} onLoad={load} />,
    intro: <div className="intro">
      <h1>{selected.heading}</h1>
      <p>{selected.body}</p>
      <div className="demo-guide"><p>{selected.guide}</p></div>
    </div>,
    worksheet: <>
      <section className="panel" aria-labelledby="scope-heading">
        <h2 id="scope-heading">{selected.scope}</h2>
        <Field label={selected.client} className="client-field">
          <Input value={bid.client} maxLength={160} onChange={event => updateBid({ ...bid, client: event.target.value })} />
        </Field>
        {bid.mode === "job" ? <div className="cost-fields schedule-fields">
          {jobFields.map(key => <NumberField key={key} label={copy.job.fields[key]} value={bid[key]}
            {...oneOffLimits[key === "materials" || key === "expenses" ? "directCosts" : key]}
            onChange={value => updateBid({ ...bid, [key]: value })} />)}
        </div> : <>
          <ProjectStages copy={copy.project} stages={bid.stages} onChange={stages => updateBid({ ...bid, stages })} />
          <div className="cost-fields schedule-fields">
            <NumberField label={copy.project.expenses} value={bid.expenses} {...oneOffLimits.directCosts}
              onChange={expenses => updateBid({ ...bid, expenses })} />
          </div>
        </>}
        <Field label={copy.notes} className="notes-field">
          <TextArea value={bid.notes} maxLength={4000} rows={3} placeholder={copy.notesPlaceholder}
            onChange={event => updateBid({ ...bid, notes: event.target.value })} />
        </Field>
      </section>
      <section className="panel" aria-labelledby="pricing-heading">
        <h2 id="pricing-heading">{copy.pricing}</h2>
        <div className="cost-fields schedule-fields">
          {pricingFields.map(key => <NumberField key={key} label={copy[key]} value={bid[key]} {...oneOffLimits[key]}
            onChange={value => updateBid({ ...bid, [key]: value })} />)}
        </div>
        <p className="assumption">{copy.pricingHelp}</p>
      </section>
      <ExampleReset label={selected.reset} confirm={copy.resetConfirm} cancel={costs.cancelReset}
        replace={costs.confirmReset} open={confirmReset === mode} onOpen={() => setConfirmReset(mode)}
        onCancel={() => setConfirmReset(null)} onReplace={reset} />
    </>,
    sheet: <BidSheet copy={{ ...bidCopy, heading: selected.price, priceUnit: selected.unit, buildLabel: copy.buildLabel, fine: copy.fine }}
      client={bid.client} valid={valid} errors={errors} price={price} parts={parts}
      rates={[{ label: copy.hours, value: number.format(result.hours) }, { label: copy.totalCost, value: preciseMoney.format(result.totalCost) }]}
      onPrint={() => window.print()} onExport={exportCsv} />,
    footer: <PageFooter method={method} footer={content.footer} links={content.links} project={content.topBar} />,
    mobileBar: <MobileBidBar label={content.modes[mode]} price={price} jump={bidCopy.jump} />,
  };
}
