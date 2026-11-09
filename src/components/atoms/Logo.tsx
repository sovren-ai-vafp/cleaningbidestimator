/** Atom: the supplied Sovren wordmark, linked home. */
export function Logo({ href, alt }: { href: string; alt: string }) {
  return <a className="logo" href={href}>
    {/* eslint-disable-next-line @next/next/no-img-element -- local vector wordmark */}
    <img src="/brand/sovren-logo-navy.svg" alt={alt} width="132" height="21" />
  </a>;
}
