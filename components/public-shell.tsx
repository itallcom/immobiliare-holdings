import Link from "next/link";

type PublicHeaderProps = {
  inverse?: boolean;
};

export function PublicMonogram({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="1" y="1" width="62" height="62" stroke="currentColor" strokeWidth="2" />
      <path d="M15 15H29M22 15V49M15 49H29" stroke="currentColor" strokeWidth="2" />
      <path d="M37 15V49M37 32H49M49 15V49" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function PublicWordmark({ className = "" }: { className?: string }) {
  return (
    <Link className={`public-wordmark ${className}`.trim()} href="/" aria-label="Immobiliare Holdings home">
      <PublicMonogram className="public-wordmark-mark" />
      <span className="public-wordmark-type">
        <strong>Immobiliare</strong>
        <small>Holdings</small>
      </span>
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
