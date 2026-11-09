import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** solid: main action. quiet: secondary. link: inline text action. onDark: light button for the bid sheet. */
  variant?: "solid" | "quiet" | "link" | "onDark";
};

/** Atom: every clickable action that isn't navigation. */
export function Button({ variant = "quiet", className = "", type = "button", ...props }: ButtonProps) {
  return <button type={type} className={`btn btn-${variant} ${className}`.trim()} {...props} />;
}
