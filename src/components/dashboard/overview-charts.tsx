"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import { RefreshCw, Wifi, WifiOff } from "lucide-react";
import { formatRupiah, getMposStatusTotals, getSectorRevenue, monthLabels, mockMonthlySeries } from "@/lib/mock-data";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const months = monthLabels;
const yearSeries = mockMonthlySeries;

function getScale(values: Array<number | null>) {
  const maximum = Math.max(...values.filter((value): value is number => value !== null), 1);
  const step = Math.max(5, Math.ceil(maximum / 4 / 5) * 5);
  return { max: step * 4, step };
}

function getColumnOptions(values: Array<number | null>): ApexOptions {
  const scale = getScale(values);
  return {
    chart: { type: "bar", toolbar: { show: false }, animations: { enabled: true, easing: "easeinout", speed: 850, animateGradually: { enabled: true, delay: 120 }, dynamicAnimation: { enabled: true, speed: 350 } } },
    colors: ["#2864e8", "#12b886"],
    plotOptions: { bar: { horizontal: false, columnWidth: "62%", borderRadius: 4, borderRadiusApplication: "end" } },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ["transparent"] },
    grid: { borderColor: "#edf1f6", strokeDashArray: 4, padding: { top: 0, right: 4, bottom: 0, left: 8 } },
    xaxis: { categories: months, labels: { style: { colors: "#6e85a3", fontSize: "12px" } }, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { min: 0, max: scale.max, tickAmount: 4, labels: { formatter: (value) => `${value} Jt`, style: { colors: "#8aa0bc", fontSize: "12px" } } },
    legend: { show: false },
    tooltip: {
      shared: true,
      intersect: false,
      custom: ({ series, dataPointIndex }) => {
        const month = months[dataPointIndex] ?? "";
        const colors = ["#2864e8", "#12b886"];
        const labels = ["Estimasi PBJT", "Realisasi"];
        const rows = series.map((values, index) => {
          const value = values[dataPointIndex];
          if (value === null || value === undefined) return "";
          return `<div class="chart-tooltip-row"><i style="background:${colors[index]}"></i><span>${labels[index]}:</span><strong>Rp ${(value * 1000000).toLocaleString("id-ID")}</strong></div>`;
        }).join("");
        return `<div class="chart-tooltip"><strong class="chart-tooltip-month">${month}</strong>${rows}</div>`;
      },
    },
  };
}

const donutOptions: ApexOptions = { chart: { type: "donut", animations: { enabled: true, speed: 850 } }, labels: ["Restoran", "Hotel"], colors: ["#2864e8", "#263f91"], dataLabels: { enabled: false }, legend: { show: false }, stroke: { width: 3, colors: ["#fff"] }, plotOptions: { pie: { donut: { size: "66%" } } }, tooltip: { y: { formatter: (value) => `Rp ${value}.000.000` } } };

export function OverviewCharts() {
  const [year, setYear] = useState<keyof typeof yearSeries>(2026);
  const data = yearSeries[year];
  const sectors = getSectorRevenue();
  const mpos = getMposStatusTotals();
  const columnOptions = useMemo(() => getColumnOptions([...data.estimate, ...data.realization]), [data]);

  return (
    <div className="overview-charts-grid">
      <section className="overview-chart-card">
        <div className="overview-chart-header"><div><h2>Estimasi PBJT vs Realisasi Pembayaran</h2><p>Tren per bulan - Januari {year} s/d Desember {year}</p></div><div className="chart-filters"><label className="chart-year-filter">Tahun <select value={year} onChange={(event) => setYear(Number(event.target.value) as keyof typeof yearSeries)}><option value="2026">2026</option><option value="2025">2025</option></select></label></div></div>
        <div className="chart-legend"><span><i className="legend-estimate" />Estimasi</span><span><i className="legend-realization" />Realisasi</span></div>
        <div className="overview-column-chart"><Chart options={columnOptions} series={[{ name: "Estimasi", data: [...data.estimate] }, { name: "Realisasi", data: [...data.realization] }]} type="bar" height="400" /></div>
      </section>
      <div className="overview-side-charts">
        <section className="overview-chart-card sector-card"><div className="overview-chart-title"><h2>Distribusi Sektor</h2><p>Omzet Restoran vs Hotel</p></div><div className="sector-content"><Chart options={donutOptions} series={[sectors.Restoran, sectors.Hotel]} type="donut" width="210" /><div className="sector-legend"><span><i className="legend-blue" />Restoran<strong>{formatRupiah(sectors.Restoran)}</strong></span><span><i className="legend-navy" />Hotel<strong>{formatRupiah(sectors.Hotel)}</strong></span></div></div></section>
        <section className="overview-chart-card status-card"><div className="overview-chart-title"><h2>Status MPOS</h2><p>Kesehatan sinkronisasi</p></div><div className="status-list"><div className="status-online"><span><Wifi size={17} />Online</span><strong>{mpos.online}</strong></div><div className="status-syncing"><span><RefreshCw size={17} />Syncing</span><strong>{mpos.syncing}</strong></div><div className="status-offline"><span><WifiOff size={17} />Offline</span><strong>{mpos.offline}</strong></div></div></section>
      </div>
    </div>
  );
}
