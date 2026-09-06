import Link from "next/link";

type PublicHeaderProps = {
  inverse?: boolean;
};

export function PublicWordmark({ className = "" }: { className?: string }) {
  return (
    <Link className={`public-wordmark ${className}`.trim()} href="/" aria-label="Immobiliare Holdings home">
      {/* The approved logo is a complete lockup; do not redraw, crop, or duplicate its lettering. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="public-wordmark-mark"
        src="/immobiliare-crest.webp"
        width="84"
        height="84"
        style={{ width: "clamp(72px, 6vw, 84px)", height: "clamp(72px, 6vw, 84px)" }}
        alt=""
      />
    </Link>
  );
}

export function PublicHeader({ inverse = false }: PublicHeaderProps) {
  return (
    <header className={`public-header${inverse ? " public-header-inverse" : ""}`}>
      <PublicWordmark />
      <nav className="public-nav" aria-label="Primary navigation">
        <Link href="/#company">Company</Link>
        <Link href="/#ownership">Ownership</Link>
        <Link href="/#stewardship">Stewardship</Link>
        <Link href="/#continuity">Continuity</Link>
      </nav>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="public-footer">
      <PublicWordmark className="public-footer-wordmark" />
      <nav className="public-footer-nav" aria-label="Footer navigation">
        <Link href="/company">Company profile</Link>
        <Link href="/operating-model">Operating model</Link>
        <Link href="/control-room">Control Room</Link>
      </nav>
      <div className="public-footer-meta">
        <span>Private holding company</span>
        <span>© 2026</span>
      </div>
    </footer>
  );
}
