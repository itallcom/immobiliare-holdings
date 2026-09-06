"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, LockKeyhole } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError("Δεν ήταν δυνατή η σύνδεση. Έλεγξε τα στοιχεία πρόσβασης.");
      setLoading(false);
      return;
    }

    window.location.assign("/control-room");
  }

  return (
    <main className="login-page">
      <section className="login-context">
        <Link href="/" className="back-link"><ArrowLeft /> Επιστροφή</Link>
        <div>
          <span className="brand-mark">H</span>
          <p className="eyebrow">Holdings control room</p>
          <h1>Η μνήμη του ομίλου ανήκει στον όμιλο.</h1>
          <p>
            Αποφάσεις, κεφάλαιο και εταιρικές σχέσεις διατηρούνται με ελεγχόμενη
            πρόσβαση και πλήρες ιστορικό.
          </p>
        </div>
        <small>Private system · European data region</small>
      </section>

      <section className="login-panel">
        <form onSubmit={signIn}>
          <span className="login-icon"><LockKeyhole /></span>
          <p className="eyebrow">Ελεγχόμενη πρόσβαση</p>
          <h2>Σύνδεση</h2>
          <p className="login-intro">Χρησιμοποίησε τα εγκεκριμένα στοιχεία του λογαριασμού σου.</p>

          <div className="field-group">
            <Label htmlFor="email">Email</Label>
            <Input
              autoComplete="email"
              id="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@company.com"
              required
              type="email"
              value={email}
            />
          </div>
          <div className="field-group">
            <Label htmlFor="password">Κωδικός πρόσβασης</Label>
            <Input
              autoComplete="current-password"
              id="password"
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </div>

          {error ? <p className="form-error" role="alert">{error}</p> : null}
          <Button className="login-button" disabled={loading} size="lg" type="submit">
            {loading ? "Σύνδεση…" : "Είσοδος στο control room"} <ArrowRight />
          </Button>
        </form>
      </section>
    </main>
  );
}
