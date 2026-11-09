import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

/** Atom: a text or number input with the shared field style. */
export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  const numeric = props.type === "number";
  return <input {...props} inputMode={numeric ? "decimal" : props.inputMode} className={`input${numeric ? " input-number" : ""} ${props.className ?? ""}`.trim()} />;
}

/** Atom: multi-line text input. */
export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className="input input-area" />;
}
