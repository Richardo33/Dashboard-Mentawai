"use client";

import { useState } from "react";
import { Calculator, ClipboardList, FileWarning, Landmark, UsersRound, WalletCards } from "lucide-react";
import { AlertsPanel } from "@/components/dashboard/alerts-panel";
import { OverviewCharts } from "@/components/dashboard/overview-charts";
import { RiskMonitoring } from "@/components/dashboard/risk-monitoring";
import { formatRupiah, getAvailableYears, getDistricts, getSptpdHistory, monthLabelsLong, mockAlerts, mockConfig, mockTaxpayers, mockTransactions } from "@/lib/mock-data";
import { FilterDropdown } from "@/components/dashboard/filter-dropdown";

export function OverviewContent() {
  const [month, setMonth] = useState("Semua");
  const [year, setYear] = useState(String(mockConfig.currentYear));
  const [businessType, setBusinessType] = useState("Semua");
  const [district, setDistrict] = useState("Semua");
  const taxpayers = mockTaxpayers.filter((taxpayer) => (businessType === "Semua" || taxpayer.type === businessType) && (district === "Semua" || taxpayer.district === district));
  const taxpayerIds = new Set(taxpayers.map((taxpayer) => taxpayer.id));
  const transactions = mockTransactions.filter((transaction) => { const date = new Date(transaction.date); return taxpayerIds.has(transaction.taxpayerId) && (year === "Semua" || date.getFullYear() === Number(year)) && (month === "Semua" || monthLabelsLong[date.getMonth()] === month); });
  const revenue = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const estimate = Math.round(revenue * mockConfig.pbjtRate);
  const selectedYears = year === "Semua" ? [2025, 2026] : [Number(year)];
  const periodRecords = taxpayers.flatMap((taxpayer) => selectedYears.flatMap((selectedYear) => getSptpdHistory(taxpayer.id, selectedYear))).filter((record) => month === "Semua" || record.period === month);
  const reported = periodRecords.reduce((sum, record) => sum + record.pbjtAmount, 0);
  const reportedCount = periodRecords.filter((record) => record.status === "Sudah Dilaporkan").length;
  const restaurants = taxpayers.filter((taxpayer) => taxpayer.type === "Restoran").length;
  const hotels = taxpayers.filter((taxpayer) => taxpayer.type === "Hotel").length;
  const districts = getDistricts().map((item) => item.name);
  const metrics = [
    { label: "TOTAL WAJIB PAJAK", value: String(taxpayers.length), note: `${restaurants} Restoran - ${hotels} Hotel`, icon: UsersRound, tone: "blue" },
    { label: "TOTAL TRANSAKSI", value: String(transactions.length), note: `Periode ${month === "Semua" ? "semua bulan" : month} - ${year === "Semua" ? "semua tahun" : year}`, icon: ClipboardList, tone: "slate" },
    { label: "OMZET TERPANTAU", value: formatRupiah(revenue), note: "Dari data MPOS", icon: Landmark, tone: "blue" },
    { label: "ESTIMASI PBJT", value: formatRupiah(estimate), note: "Hasil perhitungan sistem", icon: Calculator, tone: "blue" },
    { label: "REALISASI PBJT", value: formatRupiah(reported), note: "Dari SPTPD dilaporkan", icon: WalletCards, tone: "green" },
    { label: "GAP SELISIH", value: formatRupiah(estimate - reported), note: "Estimasi - Realisasi", icon: FileWarning, tone: "amber" },
    { label: "SPTPD", value: `${periodRecords.length ? ((reportedCount / periodRecords.length) * 100).toFixed(1).replace(".", ",") : "0,0"}%`, note: `${reportedCount}/${periodRecords.length} dilaporkan - ${Math.max(0, periodRecords.length - reportedCount)} belum`, icon: FileWarning, tone: "amber" },
    { label: "STPD OUTSTANDING", value: formatRupiah(mockConfig.stpdOutstanding), note: `${mockAlerts.filter((item) => item.type === "STPD" && item.level === "critical").length} STPD belum selesai`, icon: FileWarning, tone: "red" },
  ];

  return (
    <div className="dashboard-content overview-content" id="overview">
      <div className="overview-heading">
        <div className="overview-title"><h1 className="!font-semibold">Dashboard Monitoring PBJT</h1><p>Kabupaten Kepulauan Mentawai - Data terakhir diperbarui {mockConfig.lastUpdated}</p></div>
        <div className="overview-filters"><FilterDropdown className="filter-month" label="Bulan:" value={month} options={["Semua", ...monthLabelsLong]} onChange={setMonth} /><FilterDropdown className="filter-year" label="Tahun:" value={year} options={getAvailableYears()} onChange={setYear} /><FilterDropdown className="filter-business" label="Jenis Usaha:" value={businessType} options={["Semua", "Hotel", "Restoran"]} onChange={setBusinessType} /><FilterDropdown className="filter-district" label="Kecamatan:" value={district} options={["Semua", ...districts]} onChange={setDistrict} /></div>
      </div>
      <div className="overview-metric-grid">{metrics.map(({ label, value, note, icon: Icon, tone }) => <article className="overview-metric" key={label}><div className="overview-metric-label"><span>{label}</span><i className={`metric-icon ${tone}`}><Icon size={19} /></i></div><strong>{value}</strong><p>{note}</p></article>)}</div>
      <OverviewCharts year={year === "Semua" ? mockConfig.currentYear : Number(year)} businessType={businessType} district={district} />
      <AlertsPanel />
      <RiskMonitoring />
    </div>
  );
}
