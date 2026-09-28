"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { OverviewContent } from "@/components/dashboard/overview-content";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TaxpayerContent } from "@/components/dashboard/taxpayer-content";

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
};

function getPageAlert(activeHref: string) {
  if (activeHref === "#sptpd") return "5 rekonsiliasi memerlukan peninjauan";
  if (activeHref === "#stpd") return "3 STPD outstanding perlu diselesaikan";
  return "12 SPTPD belum dilaporkan untuk masa September";
}

export default function DashboardPage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeHref, setActiveHref] = useState("#overview");

  useEffect(() => {
    if (window.sessionStorage.getItem("mentawai-auth") !== "admin") router.replace("/");
    const updateActiveHref = () => setActiveHref(window.location.hash || "#overview");
    updateActiveHref();
    window.addEventListener("hashchange", updateActiveHref);
    return () => window.removeEventListener("hashchange", updateActiveHref);
  }, [router]);

  function logout() {
    window.sessionStorage.removeItem("mentawai-auth");
    router.replace("/");
  }

  return (
    <main className="dashboard-shell">
      <Sidebar mobileOpen={menuOpen} onMobileClose={() => setMenuOpen(false)} activeHref={activeHref} />
      <section className="dashboard-main">
        <DashboardHeader title={pageTitles[activeHref] ?? "Overview"} alert={getPageAlert(activeHref)} onMenuOpen={() => setMenuOpen(true)} onLogout={logout} />
        {activeHref === "#taxpayers" ? <TaxpayerContent /> : <OverviewContent />}
      </section>
    </main>
  );
}
