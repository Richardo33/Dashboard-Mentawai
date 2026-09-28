"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LockKeyhole, Mail, Shield } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");

  function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email || !password || !confirmation) {
      setError("Lengkapi semua data terlebih dahulu.");
      return;
    }
    if (password !== confirmation) {
      setError("Konfirmasi password belum sesuai.");
      return;
    }
    router.push("/");
  }

  return (
    <main className="register-page">
      <div className="register-brand" aria-label="Logo Kabupaten Kepulauan Mentawai"><Shield size={42} strokeWidth={1.5} /></div>
      <header className="register-heading"><h1>Create your account</h1><p>Sign up to get started</p></header>
      <form className="register-card" onSubmit={handleRegister}>
        <button type="button" className="google-button"><span className="google-g">G</span>Continue with Google</button>
        <div className="or-divider"><span>OR</span></div>
        <div className="field-group"><label htmlFor="register-email">Email</label><div className="input-shell"><Mail size={20} /><input id="register-email" type="email" value={email} onChange={(event) => { setEmail(event.target.value); setError(""); }} placeholder="you@example.com" autoComplete="email" /></div></div>
        <div className="field-group"><label htmlFor="register-password">Password</label><div className="input-shell"><LockKeyhole size={20} /><input id="register-password" type="password" value={password} onChange={(event) => { setPassword(event.target.value); setError(""); }} placeholder="********" autoComplete="new-password" /></div></div>
        <div className="field-group"><label htmlFor="register-confirmation">Confirm Password</label><div className="input-shell"><LockKeyhole size={20} /><input id="register-confirmation" type="password" value={confirmation} onChange={(event) => { setConfirmation(event.target.value); setError(""); }} placeholder="********" autoComplete="new-password" /></div></div>
        {error && <p className="login-error" role="alert">{error}</p>}
        <button type="submit" className="login-button">Create account</button>
      </form>
      <p className="register-footer">Already have an account? <Link href="/">Log in</Link></p>
    </main>
  );
}
