import { Button } from "../atoms/Button";
import { TextLink } from "../atoms/TextLink";
import type { Content } from "@/content";

type EstimatorIntroProps = {
  copy: Content["intro"];
  sampleVisits: number;
  onTrySchedule: () => void;
};

export function EstimatorIntro({ copy, sampleVisits, onTrySchedule }: EstimatorIntroProps) {
  return <div className="intro">
    <h1>{copy.heading}</h1>
    <p>{copy.body}</p>
    <div className="demo-guide">
      <p>{copy.demo}</p>
      <div className="demo-actions">
        <Button variant="solid" onClick={onTrySchedule}>{copy.trySchedule(sampleVisits)}</Button>
        <TextLink href="#adapt">{copy.adapt}</TextLink>
      </div>
    </div>
  </div>;
}
