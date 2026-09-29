"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Bell, ChevronDown, LogOut, Menu, Search, Settings, UserRound } from "lucide-react";
import { mockAlerts, mockConfig } from "@/lib/mock-data";
import { defaultUserProfile, getStoredUserProfile, initialsForName, type UserProfile } from "@/lib/user-profile";

type DashboardHeaderProps = {
  title: string;
  alert: string;
  onMenuOpen: () => void;
  onLogout: () => void;
};

export function DashboardHeader({ title, alert, onMenuOpen, onLogout }: DashboardHeaderProps) {
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState<UserProfile>(defaultUserProfile);
  const [alertIndex, setAlertIndex] = useState(0);

  const alertItems = [
    { message: `${mockAlerts.filter((item) => item.type === "SPTPD" && item.level === "warning").length} SPTPD belum dilaporkan untuk masa ${mockConfig.currentPeriod}`, critical: false },
    { message: `${mockAlerts.filter((item) => item.type === "STPD" && item.level === "critical").length} STPD outstanding perlu diselesaikan`, critical: true },
    { message: `${mockAlerts.filter((item) => item.type === "MPOS" && item.level === "critical").length} MPOS terdeteksi offline`, critical: true },
    { message: `${mockAlerts.filter((item) => item.type === "MPOS" && item.level === "warning").length} MPOS belum tersinkronisasi`, critical: false },
    { message: `${mockAlerts.filter((item) => item.type === "REKONSILIASI").length} rekonsiliasi memerlukan peninjauan`, critical: false },
  ];

  useEffect(() => {
    const updateUser = () => setUser(getStoredUserProfile());
    updateUser();
    window.addEventListener("mentawai-user-updated", updateUser);
    return () => window.removeEventListener("mentawai-user-updated", updateUser);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setAlertIndex((index) => (index + 1) % alertItems.length);
    }, 2500);
    return () => window.clearInterval(timer);
  }, [alertItems.length]);

  const activeAlert = alertItems[alertIndex] ?? { message: alert, critical: false };

  return (
    <header className="dashboard-topbar">
      <button className="mobile-menu" onClick={onMenuOpen} aria-label="Buka menu"><Menu size={21} /></button>
      <div className="topbar-breadcrumb"><span>BAPENDA PBJT</span><b>/</b><strong>{title}</strong></div>
      <div className="topbar-actions">
        <div className={`topbar-alert ${activeAlert.critical ? "is-critical" : ""}`} title={activeAlert.message} role="status" aria-live="polite"><AlertTriangle size={16} />{activeAlert.message}</div>
        <label className="topbar-search"><Search size={17} /><input aria-label="Cari wajib pajak" placeholder="Cari WP, NPWPD, invoice..." /></label>
        <button className="icon-button" aria-label="Buka Alert Center" onClick={() => router.push("/dashboard#alerts")}><Bell size={19} /><span className="notification-count">{mockAlerts.length}</span></button>
        <div className="profile-menu">
          <button type="button" className="profile-chip profile-trigger" onClick={() => setProfileOpen((open) => !open)} aria-expanded={profileOpen}>
            <div className="profile-avatar">{user.avatar ? <img src={user.avatar} alt="" /> : initialsForName(user.name)}</div><div><strong>{user.name}</strong><span>{user.role}</span></div><ChevronDown size={16} />
          </button>
          {profileOpen && <div className="profile-dropdown"><div className="profile-dropdown-header"><strong>{user.name}</strong><span>{user.email}</span></div><button type="button" onClick={() => { setProfileOpen(false); window.location.hash = "#profile"; }}><UserRound size={16} />Profil</button><button type="button" onClick={() => { setProfileOpen(false); window.location.hash = "#settings"; }}><Settings size={16} />Pengaturan</button><button type="button" className="danger" onClick={onLogout}><LogOut size={16} />Logout</button></div>}
        </div>
      </div>
    </header>
  );
}
