"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Shield } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSent(false);
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setError("Masukkan alamat email yang valid.");
      return;
    }
    if (!supabase) {
      setError("Konfigurasi Supabase belum tersedia.");
      return;
    }
    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (resetError) {
      setError("Link reset password gagal dikirim. Coba lagi.");
      return;
    }
    setSent(true);
  }

  return (
    <main className="forgot-page">
      <div className="forgot-brand" aria-label="Logo Kabupaten Kepulauan Mentawai"><Shield size={42} strokeWidth={1.5} /></div>
      <header className="forgot-heading"><h1>Reset password</h1><p>We&apos;ll send you a link to reset it</p></header>
      <form className="forgot-card" onSubmit={handleSubmit}>
        <div className="field-group"><label htmlFor="forgot-email">Email address</label><div className="input-shell"><Mail size={20} /><input id="forgot-email" type="email" value={email} onChange={(event) => { setEmail(event.target.value); setSent(false); }} placeholder="you@example.com" autoComplete="email" required /></div></div>
        {error && <p className="login-error" role="alert">{error}</p>}
        <button type="submit" className="login-button" disabled={loading}>{loading ? "Sending..." : "Send reset link"}</button>
        {sent && <p className="success-message" role="status">Reset link sent. Please check your email.</p>}
      </form>
      <Link className="back-login" href="/"><ArrowLeft size={16} />Back to log in</Link>
    </main>
  );
}
