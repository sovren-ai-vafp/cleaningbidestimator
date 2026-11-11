import { Button } from "../atoms/Button";
import { Notice } from "./Notice";

export function ExampleReset({ label, confirm, cancel, replace, open, onOpen, onCancel, onReplace }: {
  label: string; confirm: string; cancel: string; replace: string; open: boolean;
  onOpen: () => void; onCancel: () => void; onReplace: () => void;
}) {
  return <div className="reset-actions">
    {open
      ? <Notice><p>{confirm}</p><div className="notice-actions">
          <Button onClick={onCancel}>{cancel}</Button>
          <Button variant="solid" onClick={onReplace}>{replace}</Button>
        </div></Notice>
      : <Button variant="link" onClick={onOpen}>{label}</Button>}
  </div>;
}
