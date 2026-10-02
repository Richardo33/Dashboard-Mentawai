"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, LockKeyhole, Mail, Shield } from "lucide-react";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGoogleRegister() {
    if (!supabase) {
      setError("Konfigurasi Supabase belum tersedia.");
      return;
    }
    setLoading(true);
    setError("");
    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback`, queryParams: { prompt: "select_account" } },
    });
    if (googleError) {
      setLoading(false);
      setError("Pendaftaran dengan Google gagal. Coba lagi.");
    }
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password || !confirmation) {
      setError("Lengkapi semua data terlebih dahulu.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setError("Masukkan alamat email yang valid.");
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
    if (!supabase) {
      setError("Konfigurasi Supabase belum tersedia.");
      return;
    }
    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    setLoading(false);
    if (signUpError) {
      setError(signUpError.message.toLowerCase().includes("already") ? "Email tersebut sudah terdaftar." : "Pendaftaran gagal. Coba lagi.");
      return;
    }
    if (data.session) {
      router.replace("/dashboard");
      return;
    }
    setMessage("Akun berhasil dibuat. Cek email untuk mengonfirmasi akun sebelum login.");
  }

  return (
    <main className="register-page">
      <div className="register-brand" aria-label="Logo Kabupaten Kepulauan Mentawai"><Shield size={42} strokeWidth={1.5} /></div>
      <header className="register-heading"><h1>Create your account</h1><p>Sign up to get started</p></header>
      <form className="register-card" onSubmit={handleRegister}>
        <button type="button" className="google-button" onClick={() => void handleGoogleRegister()} disabled={loading}><Image src="/assets/google-g.svg" alt="" width={18} height={18} />Continue with Google</button>
        <div className="or-divider"><span>OR</span></div>
        <div className="field-group"><label htmlFor="register-email">Email</label><div className="input-shell"><Mail size={20} /><input id="register-email" type="email" value={email} onChange={(event) => { setEmail(event.target.value); setError(""); }} placeholder="you@example.com" autoComplete="email" /></div></div>
        <div className="field-group"><label htmlFor="register-password">Password</label><div className="input-shell"><LockKeyhole size={20} /><input id="register-password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => { setPassword(event.target.value); setError(""); }} placeholder="********" autoComplete="new-password" /><button type="button" className="password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
        <div className="field-group"><label htmlFor="register-confirmation">Confirm Password</label><div className="input-shell"><LockKeyhole size={20} /><input id="register-confirmation" type={showConfirmation ? "text" : "password"} value={confirmation} onChange={(event) => { setConfirmation(event.target.value); setError(""); }} placeholder="********" autoComplete="new-password" /><button type="button" className="password-toggle" onClick={() => setShowConfirmation((value) => !value)} aria-label={showConfirmation ? "Sembunyikan konfirmasi password" : "Tampilkan konfirmasi password"}>{showConfirmation ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
        {error && <p className="login-error" role="alert">{error}</p>}
        {message && <p className="success-message" role="status">{message}</p>}
        <button type="submit" className="login-button" disabled={loading}>{loading ? "Creating account..." : "Create account"}</button>
      </form>
      <p className="register-footer">Already have an account? <Link href="/">Log in</Link></p>
    </main>
  );
}
