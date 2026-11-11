import { Button } from "../atoms/Button";
import { Input } from "../atoms/Input";
import { Field } from "../molecules/Field";
import { NumberField } from "../molecules/NumberField";
import type { Content } from "@/content";
import type { Stage } from "@/lib/estimator";
import { MAX_STAGES, oneOffLimits } from "@/lib/validation";

export function ProjectStages({ copy, stages, onChange }: {
  copy: Content["oneOff"]["project"];
  stages: Stage[];
  onChange: (stages: Stage[]) => void;
}) {
  function update(id: string, changes: Partial<Omit<Stage, "id">>) {
    onChange(stages.map(stage => stage.id === id ? { ...stage, ...changes } : stage));
  }

  return <>
    <div className="project-stages">
      {stages.map(stage => <div className="project-stage" key={stage.id}>
        <Field label={copy.stageName} className="stage-name">
          <Input value={stage.label} maxLength={160} onChange={event => update(stage.id, { label: event.target.value })} />
        </Field>
        <NumberField label={copy.stageHours} value={stage.hours} {...oneOffLimits.hours} onChange={hours => update(stage.id, { hours })} />
        <NumberField label={copy.stageMaterials} value={stage.materials} {...oneOffLimits.directCosts} onChange={materials => update(stage.id, { materials })} />
        <button type="button" className="remove-button stage-remove" aria-label={copy.removeStage(stage.label)}
          onClick={() => onChange(stages.filter(item => item.id !== stage.id))}>×</button>
      </div>)}
    </div>
    <Button variant="link" className="add-area" disabled={stages.length >= MAX_STAGES}
      onClick={() => onChange([...stages, { id: crypto.randomUUID(), label: copy.newStage, hours: 0, materials: 0 }])}>
      + {copy.addStage}
    </Button>
  </>;
}
