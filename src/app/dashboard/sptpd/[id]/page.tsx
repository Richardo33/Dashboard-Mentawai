"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Sidebar } from "@/components/dashboard/sidebar";
import { SptpdDetail } from "@/components/dashboard/sptpd-detail";
import { getSptpdHistory, mockTaxpayers } from "@/lib/mock-data";
import { supabase } from "@/lib/supabase/client";

export default function SptpdDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [menuOpen, setMenuOpen] = useState(false);
  const record = mockTaxpayers.flatMap((taxpayer) => [2025, 2026].flatMap((year) => getSptpdHistory(taxpayer.id, year))).find((item) => item.id === params.id);
  const logout = () => { void supabase?.auth.signOut().finally(() => router.replace("/")); };
  const onBack = () => { const returnPath = window.sessionStorage.getItem("sptpd-detail-return") ?? "/dashboard#sptpd"; window.sessionStorage.removeItem("sptpd-detail-return"); router.push(returnPath); };
  return <main className="dashboard-shell"><Sidebar mobileOpen={menuOpen} onMobileClose={() => setMenuOpen(false)} activeHref="#sptpd" /><section className="dashboard-main"><DashboardHeader title="SPTPD" alert="5 rekonsiliasi memerlukan peninjauan" onMenuOpen={() => setMenuOpen(true)} onLogout={logout} />{record ? <div className="dashboard-content sptpd-detail-content"><SptpdDetail record={record} onBack={onBack} /></div> : <div className="dashboard-content sptpd-detail-content"><div className="taxpayer-tab-placeholder">Data SPTPD tidak ditemukan.</div></div>}</section></main>;
}
