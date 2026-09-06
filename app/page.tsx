import Link from "next/link";

import { PublicFooter, PublicHeader } from "@/components/public-shell";

export default function Home() {
  return (
    <main className="public-site" data-release="2026-09-06-heraldic-v1">
      <a className="public-skip-link" href="#company">Skip to content</a>

      <section className="public-hero" aria-labelledby="hero-heading">
        <div className="public-hero-media" aria-hidden="true" />
        <div className="public-hero-shade" aria-hidden="true" />

        <PublicHeader />

        <div className="public-hero-content">
          <div className="public-hero-statement">
            <p className="public-eyebrow">Private holding company</p>
            <h1 id="hero-heading">Ownership with a long horizon.</h1>
            <p className="public-hero-copy">
              Immobiliare Holdings is the parent company of a group of operating businesses.
            </p>
          </div>
        </div>

        <a className="public-scroll-link" href="#company">
          <span>Discover</span>
          <span aria-hidden="true">↓</span>
        </a>
      </section>

      <section className="public-editorial-section" id="company" aria-labelledby="company-heading">
        <div className="public-section-index"><span>01</span><p>Company</p></div>
        <div className="public-editorial-copy">
          <h2 id="company-heading">An ownership framework for operating businesses.</h2>
          <p className="public-lead">
            Its role includes ownership, strategic oversight and the coordination of selected
            group-level functions, supporting the development and continuity of its companies
            over the long term.
          </p>
          <p>
            Each operating company maintains its own management, commercial activity and market focus.
          </p>
          <div className="public-company-links">
            <Link className="public-text-link" href="/company">Company profile</Link>
            <Link className="public-text-link" href="/operating-model">Operating model</Link>
          </div>
        </div>
      </section>

      <section className="public-editorial-section public-editorial-dark" id="ownership" aria-labelledby="ownership-heading">
        <div className="public-section-index"><span>02</span><p>Ownership</p></div>
        <div className="public-editorial-copy">
          <h2 id="ownership-heading">Ownership is treated as a responsibility.</h2>
          <p className="public-lead">
            Ownership and operations are related but distinct responsibilities. The parent company
            maintains the ownership perspective, while each operating company remains responsible
            for the conduct of its own business.
          </p>
          <div className="public-principles">
            <article><h3>Accountability</h3><p>Clear responsibilities between the parent company and independently managed operating businesses.</p></article>
            <article><h3>Oversight</h3><p>Consideration of matters whose consequences extend beyond the immediate operating cycle.</p></article>
            <article><h3>Coordination</h3><p>Selected group-level functions addressed at the level appropriate to their scope.</p></article>
          </div>
        </div>
      </section>

      <section className="public-editorial-section public-editorial-parchment" id="stewardship" aria-labelledby="stewardship-heading">
        <div className="public-section-index"><span>03</span><p>Stewardship</p></div>
        <div className="public-editorial-copy">
          <h2 id="stewardship-heading">Operating independence. Informed ownership.</h2>
          <p className="public-lead">
            The relationship between the parent company and its operating companies is based on
            defined responsibilities rather than uniformity of activity.
          </p>
          <div className="public-editorial-rule" aria-hidden="true" />
          <p>
            Each business retains its own management, business relationships, operational priorities
            and market focus. Selected group-level functions may be coordinated where this supports
            consistency, continuity or the use of shared knowledge. Accountability remains with the
            relevant operating company.
          </p>
        </div>
      </section>

      <section className="public-continuity" id="continuity" aria-labelledby="continuity-heading">
        <div>
          <p className="public-eyebrow">Continuity</p>
          <h2 id="continuity-heading">Beyond the current cycle.</h2>
          <p className="public-lead">
            The parent company considers the conditions under which its operating companies can
            continue to develop, retain organisational knowledge and respond to changes in their
            respective environments.
          </p>
          <div className="public-continuity-principles">
            <div><span>Ownership</span><p>A stable framework</p></div>
            <div><span>Management</span><p>Clear responsibility</p></div>
            <div><span>Development</span><p>A long-term perspective</p></div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
