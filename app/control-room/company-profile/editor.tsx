"use client";

import { useActionState } from "react";
import { Eye, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CompanyProfileContent } from "@/lib/content/company-profile";

import {
  saveCompanyProfile,
  type CompanyProfileEditorState,
} from "./actions";

const initialState: CompanyProfileEditorState = { status: "idle", message: "" };

export function CompanyProfileEditor({ profile }: { profile: CompanyProfileContent }) {
  const [state, formAction, pending] = useActionState(saveCompanyProfile, initialState);

  return (
    <form action={formAction} className="profile-editor-form">
      <input name="section_count" type="hidden" value={profile.sections.length} />

      <div className="profile-editor-field">
        <Label htmlFor="profile-title">Page title</Label>
        <Input defaultValue={profile.title} id="profile-title" maxLength={120} name="title" required />
      </div>

      <div className="profile-editor-field">
        <Label htmlFor="profile-intro">Introduction</Label>
        <Textarea defaultValue={profile.intro} id="profile-intro" maxLength={800} name="intro" required rows={4} />
      </div>

      {profile.sections.map((section, index) => (
        <fieldset className="profile-editor-section" key={`${section.heading}-${index}`}>
          <legend>Section {String(index + 1).padStart(2, "0")}</legend>
          <div className="profile-editor-field">
            <Label htmlFor={`section-${index}-heading`}>Heading</Label>
            <Input
              defaultValue={section.heading}
              id={`section-${index}-heading`}
              maxLength={120}
              name={`section_${index}_heading`}
              required
            />
          </div>
          <div className="profile-editor-field">
            <Label htmlFor={`section-${index}-body`}>Text</Label>
            <Textarea
              defaultValue={section.paragraphs.join("\n\n")}
              id={`section-${index}-body`}
              maxLength={16000}
              name={`section_${index}_body`}
              required
              rows={14}
            />
            <small>Separate paragraphs with one empty line.</small>
          </div>
        </fieldset>
      ))}

      <div className="profile-editor-actions">
        <p
          aria-live="polite"
          className={state.status === "error" ? "profile-editor-message error" : "profile-editor-message"}
        >
          {state.message}
        </p>
        <div>
          <Button disabled={pending} name="intent" type="submit" value="save" variant="outline">
            <Save /> {pending ? "Saving…" : "Save draft"}
          </Button>
          <Button disabled={pending} name="intent" type="submit" value="publish">
            <Eye /> {pending ? "Publishing…" : "Publish"}
          </Button>
        </div>
      </div>
    </form>
  );
}
