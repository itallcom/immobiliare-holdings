import type { Metadata } from "next";
import Link from "next/link";

import { PublicFooter, PublicHeader } from "@/components/public-shell";

export const metadata: Metadata = {
  title: "Operating model | Immobiliare Holdings",
  description: "The relationship between the holding company and its operating companies.",
};

const responsibilities = [
  ["Ownership", "Maintains the group ownership framework.", "Operates within its own legal and commercial responsibilities."],
  ["Direction", "Considers matters with group-wide or long-term significance.", "Sets and executes business plans for its own market."],
  ["Management", "Does not replace operating management.", "Retains responsibility for people, customers and day-to-day decisions."],
  ["Coordination", "Coordinates selected matters where a group-level view is appropriate.", "Contributes relevant information while preserving operational accountability."],
];

export default function OperatingModelPage() {
  return (
    <main className="public-site public-inner-site">
      <a className="public-skip-link" href="#operating-model">Skip to content</a>
      <PublicHeader inverse />

      <section className="public-page-intro" aria-labelledby="model-title">
        <p className="public-section-label">Operating model</p>
        <h1 id="model-title">Ownership at group level. Responsibility within each business.</h1>
        <p>
          The structure separates the responsibilities of the parent company from the management and commercial activities of the operating companies.
        </p>
      </section>

      <section className="public-relationship" id="operating-model" aria-labelledby="relationship-title">
        <h2 id="relationship-title">Holding–operating company relationship</h2>
        <div className="public-relationship-flow">
          <article>
            <span>Parent company</span>
            <h3>Holding company</h3>
            <p>Ownership, long-term oversight and selected group-level coordination.</p>
          </article>
          <div className="public-relationship-line" aria-hidden="true"><span>Oversight</span><span>Reporting</span></div>
          <article>
            <span>Independent management</span>
            <h3>Operating companies</h3>
            <p>Commercial activity, operations, employees, customers and market focus.</p>
          </article>
        </div>
      </section>

      <section className="public-responsibility-table" aria-labelledby="responsibility-title">
        <div className="public-section-rule" />
        <h2 id="responsibility-title">Division of responsibilities</h2>
        <div className="public-table" role="table" aria-label="Division of responsibilities">
          <div className="public-table-row public-table-head" role="row">
            <div role="columnheader">Area</div>
            <div role="columnheader">Holding company</div>
            <div role="columnheader">Operating companies</div>
          </div>
          {responsibilities.map(([area, holding, operating]) => (
            <div className="public-table-row" role="row" key={area}>
              <div role="cell">{area}</div>
              <div role="cell">{holding}</div>
              <div role="cell">{operating}</div>
            </div>
          ))}
        </div>
        <Link className="public-text-link" href="/company">Read the company profile <span aria-hidden="true">→</span></Link>
      </section>

      <PublicFooter />
    </main>
  );
}
