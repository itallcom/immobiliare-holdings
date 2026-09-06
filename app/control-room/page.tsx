import {
  ArrowRight,
  Building2,
  ChevronRight,
  CircleDot,
  FileText,
  Landmark,
  Network,
  Orbit,
  Scale,
  Sparkles,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const navigation = ["Επισκόπηση", "Δομή ομίλου", "Κεφάλαιο", "Πρωτοβουλίες", "Αποφάσεις"];

const entities = [
  {
    name: "Holding",
    role: "Ιδιοκτησία, έλεγχος και κατανομή κεφαλαίου",
    status: "Υπό διαμόρφωση",
    tone: "draft",
    icon: Landmark,
  },
  {
    name: "Network Allcom",
    role: "Λειτουργικός και τεχνολογικός βραχίονας",
    status: "Ενεργή",
    tone: "active",
    icon: Network,
  },
  {
    name: "Investments",
    role: "Ακίνητα και επενδυτικά χαρτοφυλάκια",
    status: "Ανάπτυξη",
    tone: "progress",
    icon: WalletCards,
  },
  {
    name: "Research & Strategic Initiatives",
    role: "Μακροχρόνια έρευνα και νέα εγχειρήματα",
    status: "Πιλοτικό",
    tone: "pilot",
    icon: Orbit,
  },
];

const decisions = [
  ["Οριστικοποίηση μετοχικού χάρτη", "Holding · Investments · Network Allcom", "Ανοικτή"],
  ["Κανόνες εταιρικής διακυβέρνησης", "Ρόλοι, εγκρίσεις και όρια αποφάσεων", "Σχεδιασμός"],
  ["Δημόσια και ιδιωτική πληροφορία", "Corporate παρουσία · εσωτερικό control room", "Ανοικτή"],
];

function BrandMark() {
  return <span className="brand-mark" aria-hidden="true">H</span>;
}

function StatusPill({ tone, children }: { tone: string; children: React.ReactNode }) {
  return <span className={`status-pill status-${tone}`}>{children}</span>;
}

export default async function ControlRoom() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <BrandMark />
          <div>
            <p className="brand-name">Holdings</p>
            <p className="brand-caption">Control room</p>
          </div>
        </div>
        <nav aria-label="Κύρια πλοήγηση">
          {navigation.map((item, index) => (
            <a className={index === 0 ? "nav-link active" : "nav-link"} href={`#section-${index}`} key={item}>
              <span>0{index + 1}</span>{item}
            </a>
          ))}
        </nav>
        <div className="sidebar-footer">
          <p className="eyebrow">Κύρια βάση</p>
          <strong>Ελλάδα · EUR</strong>
          <small><i /> Υποδομή συνδεδεμένη</small>
        </div>
      </aside>

      <section className="workspace">
        <header className="mobile-header">
          <div className="brand"><BrandMark /><div><p className="brand-name">Holdings</p><p className="brand-caption">Control room</p></div></div>
          <Badge variant="outline">Draft 01</Badge>
        </header>

        <div className="workspace-inner">
          <section className="overview" id="section-0">
            <div>
              <p className="eyebrow">Κεντρική διοίκηση</p>
              <h1>Η συνολική εικόνα του ομίλου, σε ένα σημείο.</h1>
              <p className="lead">
                Εταιρική δομή, κεφάλαιο, πρωτοβουλίες και αποφάσεις με κοινή
                ιστορικότητα — από τη σημερινή ελληνική βάση έως τις επόμενες
                στρατηγικές κινήσεις.
              </p>
            </div>
            <div className="overview-actions">
              <Badge className="draft-badge" variant="outline"><CircleDot /> Δομή σε εξέλιξη</Badge>
              <Button asChild className="primary-action" size="lg">
                <Link href="/control-room/company-profile">Company Profile <FileText /></Link>
              </Button>
            </div>
          </section>

          <section aria-label="Κατάσταση συστήματος" className="signal-grid">
            {[
              ["Δομή ομίλου", "Προσχέδιο", "Η τελική ιδιοκτησιακή αλυσίδα παραμένει ανοικτή."],
              ["Νόμισμα αναφοράς", "EUR", "Κοινή βάση για αποτίμηση και αναφορές."],
              ["Δεδομένα", "PostgreSQL 17", "Ευρωπαϊκή υποδομή · Frankfurt."],
              ["Επόμενο ορόσημο", "Governance", "Ρόλοι, εγκρίσεις και πλήρες audit trail."],
            ].map(([label, value, note], index) => (
              <article className={index === 0 ? "signal-card featured" : "signal-card"} key={label}>
                <p>{label}</p><strong>{value}</strong><span>{note}</span>
              </article>
            ))}
          </section>

          <section className="content-section" id="section-1">
            <div className="section-heading">
              <div><p className="eyebrow">01 · Δομή ομίλου</p><h2>Οργανωτικός χάρτης</h2></div>
              <Button variant="ghost">Προβολή δομής <ChevronRight /></Button>
            </div>
            <div className="entity-grid">
              {entities.map((entity) => {
                const Icon = entity.icon;
                return (
                  <Card className="entity-card" key={entity.name}>
                    <CardHeader>
                      <span className="entity-icon"><Icon /></span>
                      <StatusPill tone={entity.tone}>{entity.status}</StatusPill>
                    </CardHeader>
                    <CardContent>
                      <CardTitle>{entity.name}</CardTitle>
                      <CardDescription>{entity.role}</CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          <section className="split-grid">
            <Card className="panel-card" id="section-3">
              <CardHeader className="panel-header">
                <div><p className="eyebrow">02 · Πρωτοβουλίες</p><CardTitle>Στρατηγικά προγράμματα</CardTitle></div>
                <Sparkles />
              </CardHeader>
              <CardContent>
                <div className="initiative">
                  <div className="initiative-top"><StatusPill tone="pilot">Πιλοτικό</StatusPill><span>Ορίζοντας 2026+</span></div>
                  <h3>Το Μέλλον Ενός Παιδιού</h3>
                  <p>Μακροχρόνιο πρόγραμμα έρευνας και ανάπτυξης με αφετηρία την εκπαίδευση, τη συστηματική τεκμηρίωση και τις θεσμικές συνεργασίες.</p>
                  <div className="initiative-meta"><span><Building2 /> Πρώτη θεσμική βάση</span><strong>St Catherine&apos;s</strong></div>
                </div>
              </CardContent>
            </Card>

            <Card className="panel-card" id="section-4">
              <CardHeader className="panel-header">
                <div><p className="eyebrow">03 · Αποφάσεις</p><CardTitle>Ανοικτά θέματα</CardTitle></div>
                <Scale />
              </CardHeader>
              <CardContent className="decision-list">
                {decisions.map(([title, context, state]) => (
                  <button className="decision-row" key={title} type="button">
                    <i /><span><strong>{title}</strong><small>{context}</small></span>
                    <em>{state}</em><ChevronRight />
                  </button>
                ))}
              </CardContent>
            </Card>
          </section>

          <section className="capital-section" id="section-2">
            <div>
              <p className="eyebrow">04 · Κατανομή κεφαλαίου</p>
              <h2>Απόφαση πριν από συναλλαγή.</h2>
              <p>Κάθε μεταφορά κεφαλαίου θα συνδέεται με οντότητα, σκοπό, απόφαση και αποδεικτικό — ώστε η οικονομική πραγματικότητα να παραμένει ελέγξιμη στον χρόνο.</p>
            </div>
            <div className="capital-flow" aria-label="Ροή κατανομής κεφαλαίου">
              <span>Holding</span><ArrowRight /><span>Απόφαση</span><ArrowRight /><span>Θυγατρική / Πρωτοβουλία</span>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
