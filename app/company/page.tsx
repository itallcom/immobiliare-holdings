import type { Metadata } from "next";
import Link from "next/link";

import { PublicFooter, PublicHeader } from "@/components/public-shell";
import { createClient } from "@/lib/supabase/server";
import { defaultCompanyProfile, parseCompanyProfile } from "@/lib/content/company-profile";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Company | Immobiliare Holdings",
  description: "Company profile and organisational principles.",
};

export default async function CompanyPage() {
  let profile = defaultCompanyProfile;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("site_content")
      .select("content")
      .eq("content_key", "company-profile")
      .maybeSingle();
    profile = parseCompanyProfile(data?.content);
  } catch {
    // Keep the approved profile available if the content service is unavailable.
  }

  return (
    <main className="public-site public-inner-site">
      <a className="public-skip-link" href="#company-profile">Skip to content</a>
      <PublicHeader inverse />

      <section className="public-page-intro" aria-labelledby="company-title">
        <p className="public-section-label">Company</p>
        <h1 id="company-title">{profile.title}</h1>
        <p>{profile.intro}</p>
      </section>

      <article className="public-profile" id="company-profile">
        <div className="public-profile-index" aria-label="Profile sections">
          {profile.sections.map((section, index) => (
            <div className="public-profile-index-row" key={`${section.heading}-${index}`}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{section.heading}</p>
            </div>
          ))}
        </div>

        <div className="public-profile-copy">
          {profile.sections.map((section, index) => (
            <section key={`${section.heading}-${index}`}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph, paragraphIndex) => (
                <p key={`${index}-${paragraphIndex}`}>{paragraph}</p>
              ))}
            </section>
          ))}

          <Link className="public-text-link" href="/operating-model">View the operating model <span aria-hidden="true">→</span></Link>
        </div>
      </article>

      <PublicFooter />
    </main>
  );
}
