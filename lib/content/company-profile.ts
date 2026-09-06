import type { Json } from "@/types/database";

export type CompanyProfileSection = {
  heading: string;
  paragraphs: string[];
};

export type CompanyProfileContent = {
  title: string;
  intro: string;
  sections: CompanyProfileSection[];
};

export const defaultCompanyProfile: CompanyProfileContent = {
  title: "Company profile",
  intro:
    "A parent company providing an ownership framework and long-term oversight for a group of independently managed operating businesses.",
  sections: [
    {
      heading: "Purpose and role",
      paragraphs: [
        "The company serves as the parent entity within a group of operating businesses and provides the common ownership framework through which long-term interests are held and supervised. Its role is primarily concerned with ownership, continuity, strategic oversight and the coordination of selected matters that are more appropriately considered at group level than within any single operating company. This role is exercised with regard to the separate legal identity, management responsibilities and commercial circumstances of each business. The parent company does not replace the management of its operating companies, nor does it seek to centralise activities that are more effectively undertaken close to their respective customers, employees, suppliers and markets.",
        "The group is organised on the principle that ownership and operations are related but distinct responsibilities. The parent company maintains the ownership perspective and considers matters whose consequences extend beyond the immediate operating cycle, while each operating company remains responsible for the conduct of its own business. This distinction supports clear accountability and allows operating decisions to remain within the entity possessing the relevant knowledge, resources and obligations. At the same time, it provides a stable point from which common interests, long-term development and continuity can be considered across the group as a whole.",
      ],
    },
    {
      heading: "Organisation",
      paragraphs: [
        "The relationship between the parent company and its operating companies is based on defined responsibilities rather than uniformity of activity. Operating companies may differ in market, scale, commercial model and stage of development. Each retains its own management, business relationships, operational priorities and market focus. The parent company's involvement is therefore proportionate to the nature of the matter under consideration and to the responsibilities attached to ownership. Selected group-level functions may be coordinated where this improves consistency, continuity, governance or the efficient use of shared knowledge, but coordination does not remove the accountability of the relevant operating company.",
        "Oversight is maintained through an appropriate flow of information between the operating companies and the parent company. The purpose of this information is to support informed ownership, not to duplicate operating management. Reporting, review and approval arrangements are established according to the significance of the matter, the legal and financial responsibilities involved and the requirements of the relevant business. Matters that remain within the ordinary course of operations are addressed by the operating company. Matters that affect ownership, long-term commitments, material changes or the wider interests of the group are considered within the corresponding group-level framework.",
        "This approach permits the group to maintain common standards where they are necessary while preserving the independence required for each company to operate effectively. It also recognises that different businesses do not necessarily benefit from identical processes. Common principles may therefore be applied through arrangements that reflect the practical circumstances of the individual company. The resulting structure is intended to provide sufficient consistency for responsible ownership without introducing centralisation for its own sake.",
      ],
    },
    {
      heading: "Continuity",
      paragraphs: [
        "The parent company's time horizon is not limited to the immediate reporting period. Its responsibilities include considering the conditions under which the operating companies can continue to develop, retain organisational knowledge and respond to changes in their respective environments. Long-term oversight requires attention to the durability of the ownership framework, the quality of decision-making and the ability of the group's companies to act with clarity when circumstances change. It also requires a distinction between decisions that are reversible and those that create lasting commitments for an individual company or for the group.",
        "Development is assessed in relation to the circumstances of each operating business rather than through a single measure applied uniformly across the group. The parent company may support development through oversight, coordination and the consideration of matters that extend beyond the operating remit of one company. The form of that support depends on the nature of the business and the issue concerned. The objective is to maintain a structure within which operating companies can pursue their activities responsibly, while the ownership responsibilities that connect them remain identifiable and properly administered.",
        "The group's organisational arrangements are reviewed as its businesses and obligations develop. Such review is part of ordinary stewardship and does not imply a single predetermined form for every operating company. The central requirement is that responsibility remains clear: management is accountable for operations, the parent company is accountable for ownership oversight, and matters shared across the group are addressed at the level appropriate to their scope. Through this separation of responsibilities, the group seeks to combine operating independence with the continuity of a stable ownership framework.",
      ],
    },
  ],
};

export function parseCompanyProfile(value: Json | null | undefined): CompanyProfileContent {
  if (!value || Array.isArray(value) || typeof value !== "object") return defaultCompanyProfile;

  const title = value.title;
  const intro = value.intro;
  const rawSections = value.sections;

  if (typeof title !== "string" || typeof intro !== "string" || !Array.isArray(rawSections)) {
    return defaultCompanyProfile;
  }

  const sections = rawSections.flatMap((section) => {
    if (!section || Array.isArray(section) || typeof section !== "object") return [];
    if (typeof section.heading !== "string" || !Array.isArray(section.paragraphs)) return [];
    const paragraphs = section.paragraphs.filter((paragraph): paragraph is string => typeof paragraph === "string");
    return paragraphs.length ? [{ heading: section.heading, paragraphs }] : [];
  });

  return sections.length ? { title, intro, sections } : defaultCompanyProfile;
}

export function companyProfileToJson(content: CompanyProfileContent): Json {
  return content as unknown as Json;
}
