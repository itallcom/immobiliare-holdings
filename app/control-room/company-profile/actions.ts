"use server";

import { revalidatePath } from "next/cache";

import {
  companyProfileToJson,
  type CompanyProfileContent,
} from "@/lib/content/company-profile";
import { createClient } from "@/lib/supabase/server";

export type CompanyProfileEditorState = {
  status: "idle" | "success" | "error";
  message: string;
};

function readRequiredText(formData: FormData, name: string, maximum: number) {
  const value = formData.get(name);
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  if (!normalized || normalized.length > maximum) return null;
  return normalized;
}

export async function saveCompanyProfile(
  _previousState: CompanyProfileEditorState,
  formData: FormData,
): Promise<CompanyProfileEditorState> {
  const intent = formData.get("intent") === "publish" ? "publish" : "save";
  const title = readRequiredText(formData, "title", 120);
  const intro = readRequiredText(formData, "intro", 800);
  const sectionCount = Number(formData.get("section_count"));

  if (!title || !intro || !Number.isInteger(sectionCount) || sectionCount < 1 || sectionCount > 6) {
    return { status: "error", message: "Συμπλήρωσε όλα τα απαιτούμενα πεδία." };
  }

  const sections: CompanyProfileContent["sections"] = [];
  for (let index = 0; index < sectionCount; index += 1) {
    const heading = readRequiredText(formData, `section_${index}_heading`, 120);
    const body = readRequiredText(formData, `section_${index}_body`, 16000);
    if (!heading || !body) {
      return { status: "error", message: "Κάθε ενότητα χρειάζεται τίτλο και κείμενο." };
    }

    const paragraphs = body
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
    if (!paragraphs.length) {
      return { status: "error", message: "Το κείμενο μιας ενότητας δεν μπορεί να είναι κενό." };
    }
    sections.push({ heading, paragraphs });
  }

  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return { status: "error", message: "Η συνεδρία έληξε. Συνδέσου ξανά." };
  }

  const { data: membership, error: membershipError } = await supabase
    .from("holdings_memberships")
    .select("role")
    .eq("user_id", authData.user.id)
    .maybeSingle();
  if (membershipError || !membership || !["owner", "admin"].includes(membership.role)) {
    return { status: "error", message: "Δεν έχεις δικαίωμα δημοσίευσης." };
  }

  const now = new Date().toISOString();
  const content = companyProfileToJson({ title, intro, sections });
  const { error: draftError } = await supabase.from("site_content_drafts").upsert(
    {
      content_key: "company-profile",
      content,
      updated_at: now,
      updated_by: authData.user.id,
    },
    { onConflict: "content_key" },
  );

  if (draftError) {
    return { status: "error", message: "Η αποθήκευση απέτυχε. Το κείμενο παραμένει στη φόρμα." };
  }

  if (intent === "publish") {
    const { error: publishError } = await supabase.from("site_content").upsert(
      {
        content_key: "company-profile",
        content,
        updated_at: now,
        published_at: now,
        updated_by: authData.user.id,
      },
      { onConflict: "content_key" },
    );

    if (publishError) {
      return {
        status: "error",
        message: "Το draft αποθηκεύτηκε, αλλά η δημοσίευση απέτυχε. Δοκίμασε ξανά Publish.",
      };
    }
  }

  revalidatePath("/company");
  revalidatePath("/control-room/company-profile");

  return {
    status: "success",
    message: intent === "publish" ? "Δημοσιεύτηκε στο site." : "Το draft αποθηκεύτηκε.",
  };
}
