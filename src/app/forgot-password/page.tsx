"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Shield } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (email.trim()) setSent(true);
  }

  return (
    <main className="forgot-page">
      <div className="forgot-brand" aria-label="Logo Kabupaten Kepulauan Mentawai"><Shield size={42} strokeWidth={1.5} /></div>
      <header className="forgot-heading"><h1>Reset password</h1><p>We&apos;ll send you a link to reset it</p></header>
      <form className="forgot-card" onSubmit={handleSubmit}>
        <div className="field-group"><label htmlFor="forgot-email">Email address</label><div className="input-shell"><Mail size={20} /><input id="forgot-email" type="email" value={email} onChange={(event) => { setEmail(event.target.value); setSent(false); }} placeholder="you@example.com" autoComplete="email" required /></div></div>
        <button type="submit" className="login-button">Send reset link</button>
        {sent && <p className="success-message" role="status">Reset link sent. Please check your email.</p>}
      </form>
      <Link className="back-login" href="/"><ArrowLeft size={16} />Back to log in</Link>
    </main>
  );
}
