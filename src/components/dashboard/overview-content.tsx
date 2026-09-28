"use client";

import { Calculator, ChevronDown, ClipboardList, FileWarning, Landmark, UsersRound, WalletCards } from "lucide-react";
import { AlertsPanel } from "@/components/dashboard/alerts-panel";
import { OverviewCharts } from "@/components/dashboard/overview-charts";
import { RiskMonitoring } from "@/components/dashboard/risk-monitoring";
import { formatRupiah, getDashboardTotals, mockConfig, mockTaxpayers } from "@/lib/mock-data";

function FilterButton({ label, value }: { label: string; value: string }) {
  return <button className="overview-filter"><span>{label}</span><strong>{value}</strong><ChevronDown size={15} /></button>;
}

export function OverviewContent() {
  const totals = getDashboardTotals();
  const restaurants = mockTaxpayers.filter((taxpayer) => taxpayer.type === "Restoran").length;
  const hotels = mockTaxpayers.filter((taxpayer) => taxpayer.type === "Hotel").length;
  const metrics = [
    { label: "TOTAL WAJIB PAJAK", value: String(totals.totalTaxpayers), note: `${restaurants} Restoran - ${hotels} Hotel`, icon: UsersRound, tone: "blue" },
    { label: "TOTAL TRANSAKSI", value: String(totals.totalTransactions), note: "Periode berjalan", icon: ClipboardList, tone: "slate" },
    { label: "OMZET TERPANTAU", value: formatRupiah(totals.totalRevenue), note: "Dari data MPOS", icon: Landmark, tone: "blue" },
    { label: "ESTIMASI PBJT", value: formatRupiah(totals.estimatedPbjt), note: "Hasil perhitungan sistem", icon: Calculator, tone: "blue" },
    { label: "REALISASI PBJT", value: formatRupiah(totals.reportedPbjt), note: "Dari SPTPD dilaporkan", icon: WalletCards, tone: "green" },
    { label: "GAP SELISIH", value: formatRupiah(totals.gap), note: "Estimasi - Realisasi", icon: FileWarning, tone: "amber" },
    { label: "SPTPD", value: `${((totals.reportedSptpd / totals.totalTaxpayers) * 100).toFixed(1).replace(".", ",")}%`, note: `${totals.reportedSptpd}/${totals.totalTaxpayers} dilaporkan - ${totals.totalTaxpayers - totals.reportedSptpd} belum`, icon: FileWarning, tone: "amber" },
    { label: "STPD OUTSTANDING", value: formatRupiah(mockConfig.stpdOutstanding), note: "4 STPD belum selesai", icon: FileWarning, tone: "red" },
  ];

  return (
    <div className="dashboard-content overview-content" id="overview">
      <div className="overview-heading">
        <div className="overview-title"><h1 className="!font-bold">Dashboard Monitoring PBJT</h1><p>Kabupaten Kepulauan Mentawai - Data terakhir diperbarui {mockConfig.lastUpdated}</p></div>
        <div className="overview-filters"><FilterButton label="Periode:" value={`${mockConfig.currentPeriod} ${mockConfig.currentYear}`} /><FilterButton label="Jenis Usaha:" value="Semua" /><FilterButton label="Kecamatan:" value="Semua" /></div>
      </div>
      <div className="overview-metric-grid">{metrics.map(({ label, value, note, icon: Icon, tone }) => <article className="overview-metric" key={label}><div className="overview-metric-label"><span>{label}</span><i className={`metric-icon ${tone}`}><Icon size={19} /></i></div><strong>{value}</strong><p>{note}</p></article>)}</div>
      <OverviewCharts />
      <AlertsPanel />
      <RiskMonitoring />
    </div>
  );
}
