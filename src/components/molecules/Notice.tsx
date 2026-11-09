import type { ReactNode } from "react";

/** Molecule: a short message box. "alert" is announced to screen readers. */
export function Notice({ tone = "info", children }: { tone?: "info" | "alert" | "gap"; children: ReactNode }) {
  return <div className={`notice notice-${tone}`} role={tone === "alert" ? "alert" : undefined}>{children}</div>;
}
