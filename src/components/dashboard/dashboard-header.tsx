"use client";

import { useState } from "react";
import { Bell, ChevronDown, LogOut, Menu, Search, Settings, UserRound } from "lucide-react";

type DashboardHeaderProps = {
  title: string;
  alert: string;
  onMenuOpen: () => void;
  onLogout: () => void;
};

export function DashboardHeader({ title, alert, onMenuOpen, onLogout }: DashboardHeaderProps) {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="dashboard-topbar">
      <button className="mobile-menu" onClick={onMenuOpen} aria-label="Buka menu"><Menu size={21} /></button>
      <div className="topbar-breadcrumb"><span>BAPENDA PBJT</span><b>/</b><strong>{title}</strong></div>
      <div className="topbar-actions">
        <div className="topbar-alert" title={alert}><span>△</span>{alert}</div>
        <label className="topbar-search"><Search size={17} /><input aria-label="Cari wajib pajak" placeholder="Cari WP, NPWPD, invoice..." /></label>
        <button className="icon-button" aria-label="Notifikasi"><Bell size={19} /><span className="notification-count">13</span></button>
        <div className="profile-menu">
          <button type="button" className="profile-chip profile-trigger" onClick={() => setProfileOpen((open) => !open)} aria-expanded={profileOpen}>
            <div className="profile-avatar">AL</div><div><strong>Alvin Ricardo</strong><span>Administrator</span></div><ChevronDown size={16} />
          </button>
          {profileOpen && <div className="profile-dropdown"><div className="profile-dropdown-header"><strong>Alvin Ricardo</strong><span>richardoalvin33@gmail.com</span></div><button type="button"><UserRound size={16} />Profil</button><button type="button"><Settings size={16} />Pengaturan</button><button type="button" className="danger" onClick={onLogout}><LogOut size={16} />Logout</button></div>}
        </div>
      </div>
    </header>
  );
}
