"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TaxpayerDetail } from "@/components/dashboard/taxpayer-content";
import { mockTaxpayers } from "@/lib/mock-data";
import { supabase } from "@/lib/supabase/client";

export default function TaxpayerDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [menuOpen, setMenuOpen] = useState(false);
  const taxpayer = mockTaxpayers.find((item) => item.id === params.id);
  const logout = () => { void supabase?.auth.signOut().finally(() => router.replace("/")); };
  function returnToPreviousPage() {
    const returnPath = window.sessionStorage.getItem("taxpayer-detail-return") ?? "/dashboard#taxpayers";
    window.sessionStorage.removeItem("taxpayer-detail-return");
    router.push(returnPath);
  }
  return <main className="dashboard-shell"><Sidebar mobileOpen={menuOpen} onMobileClose={() => setMenuOpen(false)} activeHref="#taxpayers" /><section className="dashboard-main"><DashboardHeader title="Semua Wajib Pajak" alert="12 SPTPD belum dilaporkan untuk masa September" onMenuOpen={() => setMenuOpen(true)} onLogout={logout} />{taxpayer ? <div className="dashboard-content taxpayer-detail-content"><TaxpayerDetail taxpayerId={taxpayer.id} onBack={returnToPreviousPage} /></div> : <div className="dashboard-content taxpayer-detail-content"><div className="taxpayer-tab-placeholder">Wajib pajak tidak ditemukan.</div></div>}</section></main>;
}
