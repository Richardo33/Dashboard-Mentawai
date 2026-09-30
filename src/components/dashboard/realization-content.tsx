"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import { CheckCircle2, ChevronLeft, ChevronRight, WalletCards, TriangleAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FilterDropdown } from "@/components/dashboard/filter-dropdown";
import { formatRupiah, getAvailableYears, getSptpdHistory, monthLabels, mockConfig, mockTaxpayers, mockTransactions } from "@/lib/mock-data";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export function RealizationContent() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [chartYear, setChartYear] = useState(String(mockConfig.currentYear));
  const [tableYear, setTableYear] = useState(String(mockConfig.currentYear));
  const [query, setQuery] = useState("");
  const selectedYear = Number(chartYear);
  const currentRows = useMemo(() => mockTaxpayers.flatMap((taxpayer) => getSptpdHistory(taxpayer.id).filter((record) => record.reportedAmount > 0).map((record) => ({ taxpayer, record }))), []);
  const rows = useMemo(() => [2025, 2026].flatMap((year) => mockTaxpayers.flatMap((taxpayer) => getSptpdHistory(taxpayer.id, year).filter((record) => record.reportedAmount > 0).map((record) => ({ taxpayer, record, reference: `REF-${record.year}${String(record.monthIndex + 1).padStart(4, "0")}${taxpayer.id.slice(-2)}` })))).sort((a, b) => b.record.year - a.record.year || b.record.monthIndex - a.record.monthIndex), []);
  const filteredRows = useMemo(() => rows.filter(({ taxpayer, record, reference }) => record.year === Number(tableYear) && `${reference} ${taxpayer.name} ${record.period}`.toLowerCase().includes(query.toLowerCase())), [query, rows, tableYear]);
  const totalPayment = currentRows.reduce((sum, row) => sum + row.record.pbjtAmount, 0);
  const taxpayerCount = new Set(currentRows.map((row) => row.taxpayer.id)).size;
  const paidCount = currentRows.length;
  const outstanding = mockTaxpayers.reduce((sum, taxpayer) => { const current = getSptpdHistory(taxpayer.id).find((record) => record.year === mockConfig.currentYear && record.monthIndex === 8); return sum + Math.max(0, Math.round((current?.mposAmount ?? 0) * mockConfig.pbjtRate) - (current?.pbjtAmount ?? 0)); }, 0);
  const partialCount = currentRows.filter(({ record }) => record.reportedAmount > 0 && record.reportedAmount < record.mposAmount).length;
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const visibleRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);
  const monthlyPayments = useMemo(() => {
    const totals = Array.from({ length: 12 }, () => 0);
    mockTaxpayers.forEach((taxpayer) => {
      getSptpdHistory(taxpayer.id, selectedYear).forEach((record) => {
        if (record.reportedAmount > 0) totals[record.monthIndex] += record.pbjtAmount;
      });
    });
    return totals;
  }, [selectedYear]);
  const chartMax = Math.max(...monthlyPayments, 1);
  const chartOptions: ApexOptions = {
    chart: { type: "bar", toolbar: { show: false }, animations: { enabled: true, speed: 500 } },
    colors: ["#2864e8"],
    plotOptions: { bar: { horizontal: false, columnWidth: "54%", borderRadius: 5, borderRadiusApplication: "end" } },
    dataLabels: { enabled: false },
    grid: { borderColor: "#c7d6e6", strokeDashArray: 4, position: "back", padding: { top: 0, right: 10, bottom: 0, left: 8 } },
    xaxis: { categories: monthLabels, labels: { style: { colors: "#6e85a3", fontSize: "12px" } }, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { min: 0, max: Math.ceil(chartMax / 10000000) * 10000000 || 10000000, tickAmount: 4, labels: { formatter: (value) => `${Math.round(value / 1000000)} Jt`, style: { colors: "#8aa0bc", fontSize: "12px" } } },
    legend: { show: false },
    tooltip: { intersect: true, shared: false, custom: ({ dataPointIndex }) => `<div class="realization-chart-tooltip"><strong>${monthLabels[dataPointIndex]} ${selectedYear}</strong><span>Total pembayaran: <b>${formatRupiah(monthlyPayments[dataPointIndex] ?? 0)}</b></span></div>` },
  };
  const metrics = [{ label: "TOTAL PEMBAYARAN", value: formatRupiah(totalPayment), note: `${paidCount} transaksi`, icon: WalletCards, tone: "green" }, { label: "WP MEMBAYAR", value: String(taxpayerCount), note: "Telah membayar", icon: CheckCircle2, tone: "blue" }, { label: "LUNAS", value: String(paidCount), note: "Pembayaran penuh", icon: CheckCircle2, tone: "green" }, { label: "OUTSTANDING", value: formatRupiah(outstanding), note: `${partialCount} sebagian`, icon: TriangleAlert, tone: "amber" }];
  return <div className="dashboard-content realization-content"><div className="realization-heading"><h1>Realisasi Pembayaran</h1><p>Data pembayaran kewajiban PBJT yang telah diterima</p></div><div className="overview-metric-grid realization-metric-grid">{metrics.map(({ label, value, note, icon: Icon, tone }) => <article className="overview-metric" key={label}><div className="overview-metric-label"><span>{label}</span><i className={`metric-icon ${tone}`}><Icon size={19} /></i></div><strong>{value}</strong><p>{note}</p></article>)}</div><section className="realization-trend-panel"><header><div><h2>Tren Realisasi Pembayaran</h2><p>Naik turunnya pembayaran PBJT yang diterima setiap bulan</p></div><FilterDropdown label="Tahun:" value={chartYear} options={getAvailableYears()} onChange={setChartYear} /></header><Chart options={chartOptions} series={[{ name: "Pembayaran", data: monthlyPayments }]} type="bar" height={340} /></section><section className="realization-table-panel"><header><label className="realization-search"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Cari referensi, WP..." /></label><FilterDropdown label="Tahun:" value={tableYear} options={getAvailableYears()} onChange={(value) => { setTableYear(value); setPage(1); }} /></header><div className="realization-table-wrap"><table className="realization-table"><thead><tr><th>REFERENSI</th><th>WAJIB PAJAK</th><th>MASA PAJAK</th><th>ESTIMASI</th><th>DIBAYAR</th><th>GAP</th><th>TANGGAL</th><th>METODE</th><th>STATUS</th></tr></thead><tbody>{visibleRows.map(({ taxpayer, record, reference }) => { const transaction = mockTransactions.find((item) => item.taxpayerId === taxpayer.id && item.date.startsWith(`${record.year}-${String(record.monthIndex + 1).padStart(2, "0")}`)); const gap = Math.max(0, Math.round(record.mposAmount * mockConfig.pbjtRate) - record.pbjtAmount); const openDetail = () => { window.sessionStorage.setItem("taxpayer-detail-return", "/dashboard#realization"); router.push(`/dashboard/taxpayers/${taxpayer.id}`); }; return <tr key={`${taxpayer.id}-${record.id}`} tabIndex={0} role="button" onClick={openDetail} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openDetail(); } }}><td className="invoice-value">{reference}</td><td className="realization-taxpayer">{taxpayer.name}</td><td>{record.period}</td><td>{formatRupiah(Math.round(record.mposAmount * mockConfig.pbjtRate))}</td><td className="realization-paid-value">{formatRupiah(record.pbjtAmount)}</td><td className="realization-gap-value">{formatRupiah(gap)}</td><td>25 {record.period.slice(0, 3)} {record.year}</td><td>{transaction?.paymentMethod ?? "Transfer Bank"}</td><td><span className="paid-status"><i />Lunas</span></td></tr>; })}</tbody></table></div><footer className="realization-table-footer"><span>Menampilkan {visibleRows.length ? (page - 1) * pageSize + 1 : 0}-{Math.min(page * pageSize, filteredRows.length)} dari {filteredRows.length} data</span><div className="pagination"><button aria-label="Halaman sebelumnya" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}><ChevronLeft size={16} /></button><span>{page}</span><button aria-label="Halaman berikutnya" disabled={page >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}><ChevronRight size={16} /></button></div></footer></section></div>;
}
