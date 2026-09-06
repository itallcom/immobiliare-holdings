import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { CompanyProfileEditor } from "./editor";
import { defaultCompanyProfile, parseCompanyProfile } from "@/lib/content/company-profile";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CompanyProfileEditorPage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/login");

  const { data: draft } = await supabase
    .from("site_content_drafts")
    .select("content, updated_at")
    .eq("content_key", "company-profile")
    .maybeSingle();

  const { data: published } = await supabase
    .from("site_content")
    .select("published_at")
    .eq("content_key", "company-profile")
    .maybeSingle();

  const profile = draft ? parseCompanyProfile(draft.content) : defaultCompanyProfile;

  return (
    <main className="profile-editor-page">
      <header className="profile-editor-header">
        <Link className="back-link" href="/control-room"><ArrowLeft /> Control Room</Link>
        <Button asChild variant="outline">
          <a href="/company" rel="noreferrer" target="_blank">View page <ExternalLink /></a>
        </Button>
      </header>

      <section className="profile-editor-intro">
        <p className="eyebrow">Content management · Edit</p>
        <h1>Company Profile</h1>
        <p>Edit the draft and publish it directly to the public page. No build is required.</p>
        {published?.published_at ? (
          <small>Last published {new Date(published.published_at).toLocaleString("en-GB", { timeZone: "Europe/Athens" })}</small>
        ) : null}
      </section>

      <CompanyProfileEditor profile={profile} />
    </main>
  );
}
