"use client";

import { useState } from "react";
import { Calculator, ClipboardList, FileWarning, Landmark, UsersRound, WalletCards } from "lucide-react";
import { AlertsPanel } from "@/components/dashboard/alerts-panel";
import { OverviewCharts } from "@/components/dashboard/overview-charts";
import { RiskMonitoring } from "@/components/dashboard/risk-monitoring";
import { formatRupiah, getDistricts, getSptpdHistory, mockAlerts, mockConfig, mockTaxpayers, mockTransactions } from "@/lib/mock-data";
import { FilterDropdown } from "@/components/dashboard/filter-dropdown";

export function OverviewContent() {
  const [year, setYear] = useState(String(mockConfig.currentYear));
  const [businessType, setBusinessType] = useState("Semua");
  const [district, setDistrict] = useState("Semua");
  const taxpayers = mockTaxpayers.filter((taxpayer) => (businessType === "Semua" || taxpayer.type === businessType) && (district === "Semua" || taxpayer.district === district));
  const taxpayerIds = new Set(taxpayers.map((taxpayer) => taxpayer.id));
  const transactions = mockTransactions.filter((transaction) => taxpayerIds.has(transaction.taxpayerId) && new Date(transaction.date).getFullYear() === Number(year));
  const revenue = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const estimate = Math.round(revenue * mockConfig.pbjtRate);
  const reported = taxpayers.reduce((sum, taxpayer) => sum + getSptpdHistory(taxpayer.id, Number(year)).reduce((subtotal, record) => subtotal + record.reportedAmount, 0), 0);
  const restaurants = taxpayers.filter((taxpayer) => taxpayer.type === "Restoran").length;
  const hotels = taxpayers.filter((taxpayer) => taxpayer.type === "Hotel").length;
  const districts = getDistricts().map((item) => item.name);
  const metrics = [
    { label: "TOTAL WAJIB PAJAK", value: String(taxpayers.length), note: `${restaurants} Restoran - ${hotels} Hotel`, icon: UsersRound, tone: "blue" },
    { label: "TOTAL TRANSAKSI", value: String(transactions.length), note: `Periode ${year}`, icon: ClipboardList, tone: "slate" },
    { label: "OMZET TERPANTAU", value: formatRupiah(revenue), note: "Dari data MPOS", icon: Landmark, tone: "blue" },
    { label: "ESTIMASI PBJT", value: formatRupiah(estimate), note: "Hasil perhitungan sistem", icon: Calculator, tone: "blue" },
    { label: "REALISASI PBJT", value: formatRupiah(reported), note: "Dari SPTPD dilaporkan", icon: WalletCards, tone: "green" },
    { label: "GAP SELISIH", value: formatRupiah(estimate - reported), note: "Estimasi - Realisasi", icon: FileWarning, tone: "amber" },
    { label: "SPTPD", value: `${taxpayers.length ? ((reported > 0 ? 1 : 0) * 100).toFixed(1).replace(".", ",") : "0,0"}%`, note: `${reported > 0 ? 1 : 0}/${taxpayers.length} dilaporkan - ${Math.max(0, taxpayers.length - (reported > 0 ? 1 : 0))} belum`, icon: FileWarning, tone: "amber" },
    { label: "STPD OUTSTANDING", value: formatRupiah(mockConfig.stpdOutstanding), note: `${mockAlerts.filter((item) => item.type === "STPD" && item.level === "critical").length} STPD belum selesai`, icon: FileWarning, tone: "red" },
  ];

  return (
    <div className="dashboard-content overview-content" id="overview">
      <div className="overview-heading">
        <div className="overview-title"><h1 className="!font-semibold">Dashboard Monitoring PBJT</h1><p>Kabupaten Kepulauan Mentawai - Data terakhir diperbarui {mockConfig.lastUpdated}</p></div>
        <div className="overview-filters"><FilterDropdown className="filter-period" label="Periode:" value={`${mockConfig.currentPeriod} ${year}`} options={["September 2026", "September 2025"]} onChange={(value) => setYear(value.endsWith("2025") ? "2025" : "2026")} /><FilterDropdown className="filter-business" label="Jenis Usaha:" value={businessType} options={["Semua", "Hotel", "Restoran"]} onChange={setBusinessType} /><FilterDropdown className="filter-district" label="Kecamatan:" value={district} options={["Semua", ...districts]} onChange={setDistrict} /></div>
      </div>
      <div className="overview-metric-grid">{metrics.map(({ label, value, note, icon: Icon, tone }) => <article className="overview-metric" key={label}><div className="overview-metric-label"><span>{label}</span><i className={`metric-icon ${tone}`}><Icon size={19} /></i></div><strong>{value}</strong><p>{note}</p></article>)}</div>
      <OverviewCharts year={Number(year)} businessType={businessType} district={district} />
      <AlertsPanel />
      <RiskMonitoring />
    </div>
  );
}
