"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BarChart3,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Shield,
} from "lucide-react";
import { nameFromEmail } from "@/lib/user-profile";
import { supabase } from "@/lib/supabase/client";

function IllustrationPlaceholder() {
  return (
    <div className="illustration" aria-hidden="true">
      <div className="coin coin-one">$</div>
      <div className="window window-large">
        <div className="window-bar">
          <i />
          <i />
          <i />
        </div>
        <div className="donut donut-main" />
        <div className="chart-lines">
          <span />
          <span />
          <span />
        </div>
      </div>
      <div className="window window-small">
        <div className="window-bar">
          <i />
          <i />
          <i />
        </div>
        <div className="wave" />
        <div className="mini-bars">
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>
      <div className="window window-bottom">
        <div className="window-bar">
          <i />
          <i />
          <i />
        </div>
        <div className="bar-chart">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>
      <div className="calculator">
        <div className="calculator-display">1738</div>
        <div className="calculator-grid">
          {[
            "C",
            "⌫",
            "%",
            "÷",
            "7",
            "8",
            "9",
            "×",
            "4",
            "5",
            "6",
            "−",
            "1",
            "2",
            "3",
            "+",
          ].map((key) => (
            <span key={key}>{key}</span>
          ))}
        </div>
      </div>
      <div className="magnifier" />
      <div className="gear">
        <BarChart3 size={28} strokeWidth={2.5} />
      </div>
      <div className="person">
        <div className="person-head" />
        <div className="person-body" />
        <div className="person-arm person-arm-left" />
        <div className="person-arm person-arm-right" />
        <div className="person-leg person-leg-left" />
        <div className="person-leg person-leg-right" />
      </div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError("Email atau password belum sesuai.");
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!supabase) {
      setError("Konfigurasi Supabase belum tersedia.");
      return;
    }
    const { data, error: loginError } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
    if (loginError || !data.user) {
      setError("Email atau password belum sesuai.");
      return;
    }
    const name = data.user.user_metadata?.name || nameFromEmail(normalizedEmail);
    window.sessionStorage.setItem("mentawai-user", JSON.stringify({ email: normalizedEmail, name, role: "Administrator", avatar: "" }));
    router.push("/dashboard");
  }

  return (
    <main className="login-page">
      <section className="welcome-panel">
        <div
          className="brand-mark"
          aria-label="Logo Kabupaten Kepulauan Mentawai"
        >
          <Shield size={42} strokeWidth={1.5} />
        </div>
        <div className="welcome-content">
          <IllustrationPlaceholder />
          <div className="welcome-copy ">
            <h1 className="text-[24px]! font-bold">
              Sistem Monitoring PBJT Terpadu
            </h1>
            <p>
              Pengawasan transaksi real-time dan rekonsiliasi pajak PBJT
              Kabupaten Kepulauan Mentawai dalam satu platform terpusat.
            </p>
          </div>
        </div>
      </section>

      <section className="form-panel">
        <div className="form-content">
          <header className="form-heading">
            <h2>Welcome back</h2>
            <p>Log in to your account</p>
          </header>
          <form className="login-card" onSubmit={handleLogin}>
            <button type="button" className="google-button">
              <span className="google-g">G</span>Continue with Google
            </button>
            <div className="or-divider">
              <span>OR</span>
            </div>
            <div className="field-group">
              <label htmlFor="email">Email</label>
              <div className="input-shell">
                <Mail size={20} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError("");
                  }}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            </div>
            <div className="field-group">
              <div className="password-label-row">
                <label htmlFor="password">Password</label>
                <Link href="/forgot-password">Forgot password?</Link>
              </div>
              <div className="input-shell">
                <LockKeyhole size={20} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                  }}
                  placeholder="********"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>
            {error && (
              <p className="login-error" role="alert">
                {error}
              </p>
            )}
            <button type="submit" className="login-button">
              Log in
            </button>
          </form>
          <p className="signup-copy">
            Don&apos;t have an account? <Link href="/register">Create one</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
