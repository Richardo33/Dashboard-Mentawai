"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Calculator, ChevronLeft, ChevronRight, Landmark, TrendingUp } from "lucide-react";
import { FilterDropdown } from "@/components/dashboard/filter-dropdown";
import { formatRupiah, getDistricts, mockConfig, mockTaxpayers, mockTransactions } from "@/lib/mock-data";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export function EstimationContent() {
  const router = useRouter();
  const [tablePeriod, setTablePeriod] = useState("September 2026");
  const [tableBusinessType, setTableBusinessType] = useState("Semua");
  const [tableDistrict, setTableDistrict] = useState("Semua");
  const [tablePage, setTablePage] = useState(1);
  const taxpayers = mockTaxpayers;
  const taxpayerIds = new Set(taxpayers.map((taxpayer) => taxpayer.id));
  const transactions = mockTransactions.filter((transaction) => taxpayerIds.has(transaction.taxpayerId) && transaction.date.startsWith(`${mockConfig.currentYear}-09`));
  const revenue = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const restaurantRevenue = transactions.filter((transaction) => mockTaxpayers.find((taxpayer) => taxpayer.id === transaction.taxpayerId)?.type === "Restoran").reduce((sum, transaction) => sum + transaction.amount, 0);
  const hotelRevenue = revenue - restaurantRevenue;
  const metrics = [
    { label: "DASAR PENGENAAN", value: formatRupiah(revenue), note: "Total omzet terpantau", icon: TrendingUp, tone: "slate" },
    { label: "ESTIMASI RESTORAN", value: formatRupiah(Math.round(restaurantRevenue * mockConfig.pbjtRate)), note: `Tarif ${mockConfig.pbjtRate * 100}%`, icon: Landmark, tone: "blue" },
    { label: "ESTIMASI HOTEL", value: formatRupiah(Math.round(hotelRevenue * mockConfig.pbjtRate)), note: `Tarif ${mockConfig.pbjtRate * 100}%`, icon: Building2, tone: "blue" },
    { label: "TOTAL ESTIMASI PBJT", value: formatRupiah(Math.round(revenue * mockConfig.pbjtRate)), note: "Periode berjalan", icon: Calculator, tone: "green" },
  ];
  const hotelEstimate = Math.round(hotelRevenue * mockConfig.pbjtRate);
  const restaurantEstimate = Math.round(restaurantRevenue * mockConfig.pbjtRate);
  const totalEstimate = hotelEstimate + restaurantEstimate;
  const maxEstimate = Math.max(hotelEstimate, restaurantEstimate, 1);
  const sectorRows = [{ label: "Pajak Hotel", type: "Hotel", estimate: hotelEstimate, revenue: hotelRevenue, count: taxpayers.filter((taxpayer) => taxpayer.type === "Hotel").length, tone: "hotel" }, { label: "Pajak Restoran", type: "Restoran", estimate: restaurantEstimate, revenue: restaurantRevenue, count: taxpayers.filter((taxpayer) => taxpayer.type === "Restoran").length, tone: "restaurant" }];
  const chartOptions: ApexOptions = { chart: { type: "bar", toolbar: { show: false }, animations: { enabled: true, speed: 650 } }, colors: ["#2864e8", "#df7a00"], plotOptions: { bar: { horizontal: false, distributed: true, columnWidth: "38%", borderRadius: 7, borderRadiusApplication: "end" } }, dataLabels: { enabled: false }, grid: { borderColor: "#c7d6e6", strokeDashArray: 4, position: "back", padding: { top: 0, right: 10, bottom: 0, left: 8 } }, xaxis: { categories: ["Hotel", "Restoran"], labels: { style: { colors: "#6e85a3", fontSize: "13px" } }, axisBorder: { show: false }, axisTicks: { show: false } }, yaxis: { min: 0, max: Math.ceil(maxEstimate / 7000000) * 7000000 || 7000000, tickAmount: 4, labels: { formatter: (value) => `${Math.round(value / 1000000)} Jt`, style: { colors: "#8aa0bc", fontSize: "12px" } } }, legend: { show: false }, tooltip: { intersect: true, shared: false, custom: ({ dataPointIndex }) => { const sector = sectorRows[dataPointIndex]; if (!sector) return ""; return `<div class="estimation-chart-tooltip"><strong>${sector.label}</strong><span>Estimasi PBJT: <b>${formatRupiah(sector.estimate)}</b></span><span>Omzet Bruto: <b>${formatRupiah(sector.revenue)}</b></span><span>${sector.count} Wajib Pajak Terdaftar</span></div>`; } } };
  const tableYear = tablePeriod.endsWith("2025") ? 2025 : 2026;
  const tableRows = useMemo(() => { const periodTransactions = mockTransactions.filter((transaction) => transaction.date.startsWith(`${tableYear}-09`)); return mockTaxpayers.filter((taxpayer) => (tableBusinessType === "Semua" || taxpayer.type === tableBusinessType) && (tableDistrict === "Semua" || taxpayer.district === tableDistrict)).map((taxpayer) => { const taxpayerTransactions = periodTransactions.filter((transaction) => transaction.taxpayerId === taxpayer.id); const omzet = taxpayerTransactions.reduce((sum, transaction) => sum + transaction.amount, 0); return { taxpayer, transaksi: taxpayerTransactions.length, omzet, estimasi: Math.round(omzet * mockConfig.pbjtRate) }; }).filter((row) => row.transaksi > 0).sort((a, b) => b.omzet - a.omzet); }, [tableBusinessType, tableDistrict, tableYear]);
  const tablePageSize = 10;
  const tableTotalPages = Math.max(1, Math.ceil(tableRows.length / tablePageSize));
  const visibleRows = tableRows.slice((tablePage - 1) * tablePageSize, tablePage * tablePageSize);
  const periodOptions = ["September 2026", "September 2025"];
  const clearTableFilters = () => { setTablePeriod("September 2026"); setTableBusinessType("Semua"); setTableDistrict("Semua"); setTablePage(1); };
  useEffect(() => {
    const openTaxpayerDetail = (event: MouseEvent) => {
      const row = (event.target as HTMLElement).closest(".estimation-table tbody tr");
      if (!row) return;
      const rowIndex = Array.from(row.parentElement?.children ?? []).indexOf(row);
      const selectedRow = visibleRows[rowIndex];
      if (selectedRow) {
        window.sessionStorage.setItem("taxpayer-detail-return", "/dashboard#estimation");
        router.push(`/dashboard/taxpayers/${selectedRow.taxpayer.id}`);
      }
    };
    document.addEventListener("click", openTaxpayerDetail);
    return () => document.removeEventListener("click", openTaxpayerDetail);
  }, [router, visibleRows]);

  return <div className="dashboard-content estimation-content"><div className="estimation-heading"><div><h1>Estimasi PBJT</h1><p>Perhitungan estimasi kewajiban PBJT berdasarkan data transaksi MPOS</p></div></div><div className="overview-metric-grid estimation-metric-grid">{metrics.map(({ label, value, note, icon: Icon, tone }) => <article className="overview-metric" key={label}><div className="overview-metric-label"><span>{label}</span><i className={`metric-icon ${tone}`}><Icon size={19} /></i></div><strong>{value}</strong><p>{note}</p></article>)}</div><div className="estimation-visual-grid"><section className="estimation-chart-panel"><header><h2>Komparasi Estimasi PBJT Antar Sektor</h2><p>Perbandingan nominal estimasi pajak yang disumbang tiap sektor usaha</p></header><Chart options={chartOptions} series={[{ name: "Estimasi PBJT", data: [hotelEstimate, restaurantEstimate] }]} type="bar" height={340} /></section><section className="estimation-structure-panel"><header><h2>Struktur Estimasi PBJT</h2><p>Pajak Barang dan Jasa Tertentu (PBJT) tarif tunggal 10% per sektor</p></header><div className="estimation-sector-list">{sectorRows.map((sector) => <div className="estimation-sector" key={sector.type}><div className="estimation-sector-title"><span><i className={sector.tone} />{sector.label}</span><strong>{formatRupiah(sector.estimate)} <small>({totalEstimate ? Math.round((sector.estimate / totalEstimate) * 100) : 0}%)</small></strong></div><div className="estimation-sector-progress"><span className={sector.tone} style={{ width: `${totalEstimate ? (sector.estimate / totalEstimate) * 100 : 0}%` }} /></div><div className="estimation-sector-meta"><span>{sector.count} Pelaku Usaha Terdaftar</span><span>Omzet: {formatRupiah(sector.revenue)}</span></div></div>)}</div><div className="estimation-structure-total"><span>Total Akumulasi Estimasi PBJT</span><strong>{formatRupiah(totalEstimate)}</strong></div></section></div><section className="estimation-table-panel"><header><div><h2>Rincian Estimasi per Wajib Pajak</h2></div><div className="estimation-table-filters"><FilterDropdown className="filter-period" label="Periode:" value={tablePeriod} options={periodOptions} onChange={(value) => { setTablePeriod(value); setTablePage(1); }} /><FilterDropdown className="filter-business" label="Jenis Usaha:" value={tableBusinessType} options={["Semua", "Hotel", "Restoran"]} onChange={(value) => { setTableBusinessType(value); setTablePage(1); }} /><FilterDropdown className="filter-district" label="Kecamatan:" value={tableDistrict} options={["Semua", ...getDistricts().map((item) => item.name)]} onChange={(value) => { setTableDistrict(value); setTablePage(1); }} /><span className="estimation-period-chip">{tablePeriod} <button onClick={() => { setTablePeriod("September 2026"); setTablePage(1); }} aria-label="Reset periode">×</button></span><button className="estimation-clear-filter" onClick={clearTableFilters}>Clear All</button><select className="estimation-year-select" value={tableYear} onChange={(event) => { setTablePeriod(`${event.target.value === "2025" ? "September 2025" : "September 2026"}`); setTablePage(1); }}><option value={2026}>2026</option><option value={2025}>2025</option></select></div></header><div className="estimation-table-wrap"><table className="estimation-table"><thead><tr><th>WAJIB PAJAK</th><th>JENIS</th><th>TRANSAKSI</th><th>OMZET</th><th>TARIF</th><th>ESTIMASI PBJT</th><th>PERIODE</th></tr></thead><tbody>{visibleRows.map(({ taxpayer, transaksi, omzet, estimasi }) => <tr key={taxpayer.id}><td><strong>{taxpayer.name}</strong><small>P.{taxpayer.id.replace("wp-", "")}.00{taxpayer.id.slice(-1)}</small></td><td>{taxpayer.type}</td><td>{transaksi}</td><td>{formatRupiah(omzet)}</td><td>{mockConfig.pbjtRate * 100}%</td><td className="estimation-value">{formatRupiah(estimasi)}</td><td>{tablePeriod}</td></tr>)}</tbody></table></div><footer className="estimation-table-footer"><span>Menampilkan {visibleRows.length ? (tablePage - 1) * tablePageSize + 1 : 0}-{Math.min(tablePage * tablePageSize, tableRows.length)} dari {tableRows.length} data</span><div className="pagination"><button aria-label="Halaman sebelumnya" disabled={tablePage <= 1} onClick={() => setTablePage((value) => Math.max(1, value - 1))}><ChevronLeft size={16} /></button><span>{tablePage}</span><button aria-label="Halaman berikutnya" disabled={tablePage >= tableTotalPages} onClick={() => setTablePage((value) => Math.min(tableTotalPages, value + 1))}><ChevronRight size={16} /></button></div></footer></section></div>;
}
