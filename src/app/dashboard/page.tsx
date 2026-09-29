"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { OverviewContent } from "@/components/dashboard/overview-content";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TaxpayerContent } from "@/components/dashboard/taxpayer-content";
import { TransactionsContent } from "@/components/dashboard/transactions-content";
import { ActivityContent } from "@/components/dashboard/activity-content";
import { EstimationContent } from "@/components/dashboard/estimation-content";
import { RealizationContent } from "@/components/dashboard/realization-content";
import { ReconciliationContent } from "@/components/dashboard/reconciliation-content";
import { GapContent } from "@/components/dashboard/gap-content";
import { SptpdContent } from "@/components/dashboard/sptpd-content";
import { StpdContent } from "@/components/dashboard/stpd-content";
import { ComplianceContent } from "@/components/dashboard/compliance-content";
import { AlertCenterContent } from "@/components/dashboard/alert-center-content";
import { MposContent } from "@/components/dashboard/mpos-content";
import { AccountContent } from "@/components/dashboard/account-content";
import { clearDashboardData, mockAlerts, mockConfig, syncDashboardData } from "@/lib/mock-data";
import { supabase } from "@/lib/supabase/client";

const pageTitles: Record<string, string> = {
  "#overview": "Overview",
  "#taxpayers": "Semua Wajib Pajak",
  "#transactions": "Semua Transaksi",
  "#activity": "Aktivitas Transaksi",
  "#estimation": "Estimasi PBJT",
  "#realization": "Realisasi Pembayaran",
  "#reconciliation": "Rekonsiliasi",
  "#gap": "Selisih / Gap",
  "#sptpd": "SPTPD",
  "#stpd": "STPD",
  "#compliance": "Status Kepatuhan",
  "#alerts": "Alert Center",
  "#mpos": "Status MPOS",
  "#profile": "Profil",
  "#settings": "Pengaturan",
};

function getPageAlert(activeHref: string) {
  if (activeHref === "#sptpd") return `${mockAlerts.filter((item) => item.type === "REKONSILIASI").length} rekonsiliasi memerlukan peninjauan`;
  if (activeHref === "#stpd") return `${mockAlerts.filter((item) => item.type === "STPD").length} STPD outstanding perlu diselesaikan`;
  return `${mockAlerts.filter((item) => item.type === "SPTPD").length} SPTPD belum dilaporkan untuk masa ${mockConfig.currentPeriod}`;
}

export default function DashboardPage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeHref, setActiveHref] = useState<string | null>(null);
  const [databaseReady, setDatabaseReady] = useState(false);
  const [databaseError, setDatabaseError] = useState(false);

  useEffect(() => {
    if (!supabase) {
      router.replace("/");
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.replace("/");
    });
    const updateActiveHref = () => setActiveHref(window.location.hash || "#overview");
    updateActiveHref();
    window.addEventListener("hashchange", updateActiveHref);
    return () => window.removeEventListener("hashchange", updateActiveHref);
  }, [router]);

  useEffect(() => {
    clearDashboardData();
    syncDashboardData()
      .then(() => setDatabaseReady(true))
      .catch(() => setDatabaseError(true));
  }, []);

  function logout() {
    void supabase?.auth.signOut().finally(() => router.replace("/"));
  }

  return (
    <main className="dashboard-shell">
      <Sidebar mobileOpen={menuOpen} onMobileClose={() => setMenuOpen(false)} activeHref={activeHref ?? ""} />
      <section className="dashboard-main">
        <DashboardHeader title={activeHref ? pageTitles[activeHref] ?? "Overview" : ""} alert={activeHref ? getPageAlert(activeHref) : ""} onMenuOpen={() => setMenuOpen(true)} onLogout={logout} />
        {!activeHref || !databaseReady ? <div className="dashboard-route-loading" aria-hidden={!databaseError} /> : activeHref === "#taxpayers" ? <TaxpayerContent /> : activeHref === "#transactions" ? <TransactionsContent /> : activeHref === "#activity" ? <ActivityContent /> : activeHref === "#estimation" ? <EstimationContent /> : activeHref === "#realization" ? <RealizationContent /> : activeHref === "#reconciliation" ? <ReconciliationContent /> : activeHref === "#gap" ? <GapContent /> : activeHref === "#sptpd" ? <SptpdContent /> : activeHref === "#stpd" ? <StpdContent /> : activeHref === "#compliance" ? <ComplianceContent /> : activeHref === "#alerts" ? <AlertCenterContent /> : activeHref === "#mpos" ? <MposContent /> : activeHref === "#profile" ? <AccountContent mode="profile" /> : activeHref === "#settings" ? <AccountContent mode="settings" /> : <OverviewContent />}
      </section>
    </main>
  );
}
