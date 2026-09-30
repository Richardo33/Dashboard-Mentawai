"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Sidebar } from "@/components/dashboard/sidebar";
import { StpdDetail } from "@/components/dashboard/stpd-detail";
import { getSptpdHistory, mockTaxpayers } from "@/lib/mock-data";
import { supabase } from "@/lib/supabase/client";

export default function StpdDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [menuOpen, setMenuOpen] = useState(false);
  const match = params.id.match(/^(wp-\d+)-(\d{4})-(\d+)$/);
  const taxpayer = match ? mockTaxpayers.find((item) => item.id === match[1]) : undefined;
  const record = taxpayer && match ? getSptpdHistory(taxpayer.id, Number(match[2])).find((item) => item.monthIndex === Number(match[3]) - 1) : undefined;
  const logout = () => { void supabase?.auth.signOut().finally(() => router.replace("/")); };
  const onBack = () => { const returnPath = window.sessionStorage.getItem("stpd-detail-return") ?? "/dashboard#taxpayers"; window.sessionStorage.removeItem("stpd-detail-return"); router.push(returnPath); };
  return <main className="dashboard-shell"><Sidebar mobileOpen={menuOpen} onMobileClose={() => setMenuOpen(false)} activeHref="#taxpayers" /><section className="dashboard-main"><DashboardHeader title="Semua Wajib Pajak" alert="12 SPTPD belum dilaporkan untuk masa September" onMenuOpen={() => setMenuOpen(true)} onLogout={logout} />{taxpayer && record ? <div className="dashboard-content stpd-detail-content"><StpdDetail taxpayer={taxpayer} record={record} onBack={onBack} /></div> : <div className="dashboard-content stpd-detail-content"><div className="taxpayer-tab-placeholder">Data STPD tidak ditemukan.</div></div>}</section></main>;
}
