"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, FileText, Hash, MapPin, Plus, Search, Store, UsersRound, Wifi } from "lucide-react";
import { formatRupiah, getDashboardTotals, getDistricts, mockConfig, mockSptpd, mockTaxpayers, mockTransactions } from "@/lib/mock-data";

const taxpayerImage = "/assets/taxpayers/mentawai-resort.webp";

function TaxpayerDetail({ taxpayerId, onBack }: { taxpayerId: string; onBack: () => void }) {
  const taxpayer = mockTaxpayers.find((item) => item.id === taxpayerId);
  if (!taxpayer) return null;
  const transactions = mockTransactions.filter((transaction) => transaction.taxpayerId === taxpayer.id);
  const revenue = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const estimate = Math.round(revenue * mockConfig.pbjtRate);
  const reported = mockSptpd.find((record) => record.taxpayerId === taxpayer.id)?.reportedAmount ?? 0;

  return <div className="taxpayer-detail-view"><button className="taxpayer-back" onClick={onBack}><ArrowLeft size={17} />Kembali</button><section className="taxpayer-detail-card"><div className="taxpayer-detail-image"><Image src={taxpayerImage} alt={`Foto ${taxpayer.name}`} fill sizes="340px" priority /></div><div className="taxpayer-detail-main"><div className="taxpayer-detail-heading"><div><h1>{taxpayer.name}</h1><p>Jl. Pantai Tuapejat, {taxpayer.village}, Mentawai</p></div><span className="active-status"><i />{taxpayer.active ? "Aktif" : "Tidak Aktif"}</span></div><div className="taxpayer-info-grid"><div><h2>DATA USAHA</h2><dl><dt><FileText size={16} />NPWPD</dt><dd>P.{taxpayer.id.replace("wp-", "")}.001</dd><dt><Store size={16} />Jenis Usaha</dt><dd>{taxpayer.type}</dd><dt><MapPin size={16} />Kecamatan</dt><dd>{taxpayer.district}</dd><dt><CalendarDays size={16} />Terdaftar</dt><dd>15 Jan 2024</dd><dt><Wifi size={16} />Status MPOS</dt><dd>{taxpayer.mposStatus === "online" ? "Online" : taxpayer.mposStatus === "syncing" ? "Syncing" : "Offline"}</dd></dl></div><div><h2>DATA PEMILIK</h2><dl><dt><UsersRound size={16} />Nama Pemilik</dt><dd>Pengelola {taxpayer.name}</dd><dt><Hash size={16} />NPWP</dt><dd>01.234.567.0-001.000</dd><dt><FileText size={16} />Kontak</dt><dd>081234500001</dd></dl></div></div></div></section><div className="taxpayer-detail-metrics"><article><span>TRANSAKSI</span><strong>{transactions.length}</strong><small>Total tercatat</small></article><article><span>OMZET</span><strong>{formatRupiah(revenue)}</strong><small>Periode berjalan</small></article><article><span>ESTIMASI PBJT</span><strong>{formatRupiah(estimate)}</strong><small>Tarif {mockConfig.pbjtRate * 100}%</small></article><article><span>REALISASI</span><strong>{formatRupiah(reported)}</strong><small>Pembayaran</small></article><article><span>GAP</span><strong>{formatRupiah(estimate - reported)}</strong><small>Estimasi - Realisasi</small></article></div><div className="taxpayer-detail-tabs"><button className="is-active">Overview</button><button>Transaksi</button><button>SPTPD</button><button>Pembayaran</button><button>STPD</button></div></div>;
}

export function TaxpayerContent() {
  const [query, setQuery] = useState("");
  const [businessType, setBusinessType] = useState("Semua");
  const [district, setDistrict] = useState("Semua");
  const [page, setPage] = useState(1);
  const [selectedTaxpayerId, setSelectedTaxpayerId] = useState<string | null>(null);
  const totals = getDashboardTotals();
  const districts = getDistricts();
  const pageSize = 10;
  const filteredTaxpayers = useMemo(() => mockTaxpayers.filter((taxpayer) => {
    const normalizedQuery = query.trim().toLowerCase();
    const matchesQuery = !normalizedQuery || `${taxpayer.name} ${taxpayer.id} ${taxpayer.village}`.toLowerCase().includes(normalizedQuery);
    const matchesType = businessType === "Semua" || taxpayer.type === businessType;
    const matchesDistrict = district === "Semua" || taxpayer.district === district;
    return matchesQuery && matchesType && matchesDistrict;
  }), [businessType, district, query]);
  const totalPages = Math.max(1, Math.ceil(filteredTaxpayers.length / pageSize));
  const visibleTaxpayers = filteredTaxpayers.slice((Math.min(page, totalPages) - 1) * pageSize, Math.min(page, totalPages) * pageSize);
  const metrics = [
    { label: "TOTAL WP", value: String(totals.totalTaxpayers), note: `${totals.activeTaxpayers} aktif`, icon: UsersRound, tone: "blue" },
    { label: "TERHUBUNG MPOS", value: String(totals.connectedMpos), note: `${totals.totalTaxpayers - totals.connectedMpos} belum`, icon: Wifi, tone: "green" },
    { label: "TOTAL OMZET", value: formatRupiah(totals.totalRevenue), note: "Periode berjalan", icon: Store, tone: "slate" },
    { label: "GAP PBJT", value: formatRupiah(totals.gap), note: "Estimasi - Realisasi", icon: Store, tone: "amber" },
  ];

  if (selectedTaxpayerId) return <TaxpayerDetail taxpayerId={selectedTaxpayerId} onBack={() => setSelectedTaxpayerId(null)} />;

  return (
    <div className="dashboard-content taxpayer-content">
      <div className="taxpayer-heading"><div><h1>Semua Wajib Pajak</h1><p>Database utama objek pajak PBJT yang dipantau BAPENDA</p></div><button className="primary-action"><Plus size={18} />Tambah Wajib Pajak</button></div>
      <div className="taxpayer-metrics">{metrics.map(({ label, value, note, icon: Icon, tone }) => <article className="overview-metric" key={label}><div className="overview-metric-label"><span>{label}</span><i className={`metric-icon ${tone}`}><Icon size={19} /></i></div><strong>{value}</strong><p>{note}</p></article>)}</div>
      <section className="district-panel"><header className="district-header"><div className="district-heading"><div className="district-icon"><MapPin size={19} /></div><div><h2>Sebaran WP per Kecamatan &amp; Desa</h2><p>Wilayah administratif Kabupaten Kepulauan Mentawai - Kode Kemendagri 13.09</p></div></div><div className="district-totals"><span>Kecamatan terisi<strong>{districts.filter((district) => district.taxpayerCount > 0).length}/{districts.length}</strong></span><span>Desa terisi<strong>{districts.reduce((total, district) => total + district.filledVillages, 0)}/43</strong></span><span>Total WP<strong>{mockTaxpayers.length}</strong></span></div></header><div className="district-grid">{districts.slice(0, 10).map((district) => <article className="district-card" key={district.name}><div className="district-card-top"><div><h3>{district.name} <small>{district.code}</small></h3><p>{district.villages.length} desa - {district.taxpayerCount} terisi data</p></div><span className={district.taxpayerCount === 0 ? "empty-badge" : "wp-badge"}>{district.taxpayerCount} WP</span></div><div className="village-list">{district.villages.slice(0, 5).map((village) => <span className={mockTaxpayers.some((taxpayer) => taxpayer.district === district.name && taxpayer.village === village) ? "filled-village" : ""} key={village}>{village}</span>)}</div></article>)}</div></section>
      <section className="taxpayer-table-panel">
        <div className="taxpayer-table-toolbar"><label className="taxpayer-search"><Search size={18} /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Cari nama, NPWPD, alamat..." /></label><select value={businessType} onChange={(event) => { setBusinessType(event.target.value); setPage(1); }}><option>Semua</option><option>Hotel</option><option>Restoran</option></select><select value={district} onChange={(event) => { setDistrict(event.target.value); setPage(1); }}><option>Semua</option>{districts.map((item) => <option key={item.name}>{item.name}</option>)}</select><span className="table-period">{mockConfig.currentPeriod} {mockConfig.currentYear}</span></div>
        <div className="taxpayer-table-wrap"><table className="taxpayer-table"><thead><tr><th>NAMA WP</th><th>NPWPD</th><th>JENIS</th><th>KECAMATAN</th><th>TRANSAKSI</th><th>OMZET</th><th>ESTIMASI</th><th>REALISASI</th><th>STATUS</th></tr></thead><tbody>{visibleTaxpayers.map((taxpayer) => { const transactions = mockTransactions.filter((transaction) => transaction.taxpayerId === taxpayer.id); const revenue = transactions.reduce((sum, transaction) => sum + transaction.amount, 0); const sptpd = mockSptpd.find((record) => record.taxpayerId === taxpayer.id); return <tr key={taxpayer.id} tabIndex={0} role="button" onClick={() => setSelectedTaxpayerId(taxpayer.id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setSelectedTaxpayerId(taxpayer.id); }}><td><div className="taxpayer-name-cell"><span className="taxpayer-avatar"><Image src={taxpayerImage} alt="" fill sizes="50px" /></span><div><strong>{taxpayer.name}</strong><small>{taxpayer.village}</small></div></div></td><td>P.{taxpayer.id.replace("wp-", "")}.001</td><td>{taxpayer.type}</td><td>{taxpayer.district}</td><td>{transactions.length}</td><td>{formatRupiah(revenue)}</td><td>{formatRupiah(Math.round(revenue * mockConfig.pbjtRate))}</td><td className="realized-value">{formatRupiah(sptpd?.reportedAmount ?? 0)}</td><td><span className={taxpayer.active ? "active-status" : "inactive-status"}><i />{taxpayer.active ? "Aktif" : "Tidak Aktif"}</span></td></tr>; })}</tbody></table></div>
        <footer className="taxpayer-table-footer"><span>Menampilkan {visibleTaxpayers.length} dari {filteredTaxpayers.length} wajib pajak</span><div className="pagination"><button aria-label="Halaman sebelumnya" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}><ChevronLeft size={16} /></button><span>Halaman {Math.min(page, totalPages)} dari {totalPages}</span><button aria-label="Halaman berikutnya" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}><ChevronRight size={16} /></button></div></footer>
      </section>
    </div>
  );
}
