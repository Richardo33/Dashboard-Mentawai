"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { LockKeyhole, Shield } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(supabase ? "" : "Konfigurasi Supabase belum tersedia.");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => setReady(Boolean(data.session)));
    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!ready) {
      setError("Link reset password tidak valid atau sudah kedaluwarsa.");
      return;
    }
    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }
    if (password !== confirmation) {
      setError("Konfirmasi password belum sesuai.");
      return;
    }
    setLoading(true);
    const { error: updateError } = await supabase!.auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      setError("Password gagal diperbarui. Minta link reset baru.");
      return;
    }
    await supabase!.auth.signOut();
    setMessage("Password berhasil diperbarui. Silakan login kembali.");
    setPassword("");
    setConfirmation("");
    setReady(false);
  }

  return (
    <main className="forgot-page">
      <div className="forgot-brand" aria-label="Logo Kabupaten Kepulauan Mentawai"><Shield size={42} strokeWidth={1.5} /></div>
      <header className="forgot-heading"><h1>Set new password</h1><p>Create a new password for your account</p></header>
      <form className="forgot-card" onSubmit={handleSubmit}>
        <div className="field-group"><label htmlFor="reset-password">New password</label><div className="input-shell"><LockKeyhole size={20} /><input id="reset-password" type="password" value={password} onChange={(event) => { setPassword(event.target.value); setError(""); }} autoComplete="new-password" required /></div></div>
        <div className="field-group"><label htmlFor="reset-confirmation">Confirm password</label><div className="input-shell"><LockKeyhole size={20} /><input id="reset-confirmation" type="password" value={confirmation} onChange={(event) => { setConfirmation(event.target.value); setError(""); }} autoComplete="new-password" required /></div></div>
        {error && <p className="login-error" role="alert">{error}</p>}
        {message && <p className="success-message" role="status">{message}</p>}
        <button type="submit" className="login-button" disabled={loading}>{loading ? "Updating..." : "Update password"}</button>
      </form>
      <Link className="back-login" href="/">Back to log in</Link>
    </main>
  );
}
