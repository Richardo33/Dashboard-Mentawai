"use client";

import { ArrowLeft, Building2, CalendarDays, CreditCard, FileText } from "lucide-react";
import { jsPDF } from "jspdf";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatRupiah, getTaxpayer, mockConfig, type SptpdPeriodRecord } from "@/lib/mock-data";

async function downloadSptpdPdf(record: SptpdPeriodRecord) {
  const taxpayer = getTaxpayer(record.taxpayerId);
  if (!taxpayer) return;

  const logoResponse = await fetch("/assets/branding/bapenda-mentawai.png");
  const logoBlob = await logoResponse.blob();
  const logoData = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(logoBlob);
  });

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const left = 7;
  const right = pageWidth - 7;
  const width = right - left;
  const isHotel = taxpayer.type === "Hotel";
  const title = isHotel ? "PBJT- JASA PERHOTELAN" : "PBJT- MAKAN DAN/ATAU MINUMAN";
  const businessType = isHotel ? "Klasifikasi Perhotelan : Hotel/Hostel/Vila/Resort/Penginapan*" : "Klasifikasi Usaha : Restoran/Bar/Pub/Cafe*";
  const revenueRows = isHotel ? ["Pendapatan dari Persewaan Kamar", "Pendapatan dari Service Charge di Kamar", "Pendapatan Lain-Lain"] : ["Pendapatan dari Makanan dan Minuman", "Pendapatan dari Service Charge", "Pendapatan Lain-Lain"];
  const reference = `SPTPD/PBJT/${record.year}/${String(record.monthIndex + 25).padStart(4, "0")}`;
  const npwpd = `P.${taxpayer.id.replace("wp-", "")}.001`;
  const address = `${taxpayer.address}, ${taxpayer.village}, Kecamatan ${taxpayer.district}`;
  const amount = (value: number) => formatRupiah(value).replace(/^Rp\s?/, "");
  let y = 8;

  const text = (value: string, x: number, baseline: number, size = 7, bold = false, maxWidth?: number) => {
    doc.setFont("helvetica", bold ? "bold" : "normal").setFontSize(size);
    doc.text(doc.splitTextToSize(value, maxWidth ?? width), x, baseline);
  };
  const cell = (x: number, top: number, cellWidth: number, cellHeight: number, value = "", options: { bold?: boolean; size?: number; align?: "left" | "center" | "right" } = {}) => {
    doc.rect(x, top, cellWidth, cellHeight);
    if (!value) return;
    const lines = doc.splitTextToSize(value, cellWidth - 3);
    const baseline = top + Math.min(cellHeight - 2, 4.1);
    doc.setFont("helvetica", options.bold ? "bold" : "normal").setFontSize(options.size ?? 7);
    const align = options.align ?? "left";
    const textX = align === "center" ? x + cellWidth / 2 : align === "right" ? x + cellWidth - 2 : x + 2;
    doc.text(lines, textX, baseline, { align, maxWidth: cellWidth - 3 });
  };
  const section = (label: string) => {
    cell(left, y, width, 6, label, { bold: true, size: 8 });
    y += 6;
  };
  const formRow = (number: string, label: string, value: string, height = 6) => {
    const numberWidth = 10;
    const labelWidth = 48;
    cell(left, y, numberWidth, height, number, { align: "center", size: 7 });
    cell(left + numberWidth, y, labelWidth, height, label, { size: 7 });
    cell(left + numberWidth + labelWidth, y, 8, height, ":", { align: "center", size: 7 });
    cell(left + numberWidth + labelWidth + 8, y, width - numberWidth - labelWidth - 8, height, value, { size: 7 });
    y += height;
  };

  doc.addImage(logoData, "PNG", left, y, width, 24);
  y += 26;
  const titleWidth = width * 0.56;
  const recipientWidth = width - titleWidth;
  cell(left, y, titleWidth, 32);
  text("SURAT PEMBERITAHUAN PAJAK DAERAH (SPTPD)", left + 2, y + 6, 9, true, titleWidth - 4);
  text(title, left + 6, y + 14, 10, true, titleWidth - 10);
  text(`Masa Pajak : ${record.period}`, left + 6, y + 22, 8);
  text(`Tahun Pajak : ${record.year}`, left + 6, y + 27, 8);
  text(`Tahun Pajak : ${record.year}`, left + 6, y + 25, 8);
  cell(left + titleWidth, y, recipientWidth, 32);
  text("Kepada Yth. Kepala Bapenda", left + titleWidth + 6, y + 7, 8);
  text("Kabupaten Kepulauan Mentawai", left + titleWidth + 6, y + 13, 8);
  text("di -", left + titleWidth + 6, y + 19, 8);
  text("Tuapeijat", left + titleWidth + 18, y + 27, 8);
  y += 32;

  text("Perhatian :", left, y + 4, 8, true);
  y += 7;
  const notices = ["Harap diisi dalam rangkap 2 dan ditulis dengan huruf CETAK.", "Beri nomor pada kotak yang tersedia untuk jawaban yang diberikan.", "Setelah diisi dan ditandatangani, harap diserahkan kembali kepada Unit Pelayanan Pemungutan Pajak Daerah dimana Wajib Pajak terdaftar, paling lambat tanggal 15 bulan berikutnya.", "Keterlambatan Penyerahan SPTPD, dikenakan sanksi sesuai ketentuan yang berlaku."];
  notices.forEach((notice, index) => { const lines = doc.splitTextToSize(notice, width - 16); text(String(index + 1), left + 2, y + 4, 7); text(lines.join(" "), left + 11, y + 4, 7, false, width - 16); y += Math.max(7, lines.length * 4 + 2); });

  section("I. Identitas Wajib Pajak :");
  formRow("1", "Nama Wajib Pajak", taxpayer.name);
  formRow("2", "Alamat Wajib Pajak", address, 8);
  formRow("", "", `Dusun ${taxpayer.village}    Desa ${taxpayer.village}    Kode Pos -`, 6);
  formRow("3", "Nama Objek/Usaha", taxpayer.name);
  formRow("4", "Alamat Objek/Usaha", address);
  formRow("5", "NPWPD", npwpd);
  formRow("6", "NOPD", "-");
  formRow("7", "No Telepon / Hp / WA", taxpayer.ownerContact);
  formRow("8", "Email", taxpayer.ownerEmail);

  section("II. Diisi oleh Wajib Pajak :");
  cell(left, y, 10, 14, "a)", { align: "center", size: 7 });
  cell(left + 10, y, width - 10, 14, businessType, { size: 7 });
  y += 14;
  cell(left, y, 10, 6, "b)", { align: "center", size: 7 });
  cell(left + 10, y, width - 10, 6, "Data Pembayaran", { bold: true, size: 8 });
  y += 6;
  cell(left + 10, y, 20, 5, "1)", { bold: true, size: 7 });
  cell(left + 30, y, width - 30, 5, "Pembayaran dari :", { bold: true, size: 7 });
  y += 5;
  revenueRows.forEach((label, index) => { cell(left + 18, y, 8, 5, `${String.fromCharCode(97 + index)})`, { align: "center", size: 6.5 }); cell(left + 26, y, width - 57, 5, label, { size: 6.5 }); cell(right - 31, y, 12, 5, "Rp.", { size: 6.5 }); cell(right - 19, y, 19, 5, index === 0 ? amount(record.reportedAmount) : "0", { align: "right", size: 6.5 }); y += 5; });
  cell(left + 10, y, width - 10, 6, "2)    Dasar Pengenaan Pajak (DPP)                                  Dalam Rupiah", { bold: true, size: 7 });
  y += 6;
  cell(left + 18, y, width - 49, 5, "Jumlah 1 ( a + b )", { size: 7 }); cell(right - 19, y, 19, 5, amount(record.reportedAmount), { align: "right", size: 7 }); y += 5;
  cell(left + 10, y, width - 10, 6, "3)    Pajak Terutang                         (TARIF x DPP)", { size: 7 }); cell(right - 19, y, 19, 6, amount(record.pbjtAmount), { align: "right", size: 7 }); y += 6;
  cell(left + 10, y, width - 10, 5, "4)    Sanksi / Denda", { size: 7 }); cell(right - 19, y, 19, 5, "0", { align: "right", size: 7 }); y += 5;
  cell(left + 10, y, width - 10, 5, "5)    Pajak Yang Telah Dibayar", { size: 7 }); cell(right - 19, y, 19, 5, record.status === "Belum Dilaporkan" ? "0" : amount(record.pbjtAmount), { align: "right", size: 7 }); y += 5;
  cell(left + 10, y, width - 10, 5, "6)    Pajak Kurang atau Lebih Bayar (6= 3+4+5)", { size: 7 }); cell(right - 19, y, 19, 5, "0", { align: "right", size: 7 }); y += 5;
  cell(left + 10, y, width - 10, 6, `7)    ${isHotel ? "PBJT Jasa Perhotelan" : "PBJT Jasa Makanan dan/atau Minuman"} kurang dibayar dilunasi tanggal ____-____-____ (dd-mm-yy)`, { size: 6.5 }); y += 6;

  section("III. Data Pendukung :");
  ["Surat Setoran Pajak Daerah (SSPD)", "Rekapitulasi Penjualan/Omzet", "Rekapitulasi Penggunaan Bon/Bill", "Rincian Data Transaksi Untuk Masa Pajak Yang Bersangkutan", "........................................................................"].forEach((item, index) => { cell(left, y, 10, 5, `${index + 1})`, { align: "center", size: 6.5 }); cell(left + 10, y, width * 0.62 - 10, 5, item, { size: 6.5 }); cell(left + width * 0.62, y, width * 0.38, 5, "Ada / Tidak ada *", { align: "center", size: 6.5 }); y += 5; });
  const declaration = "Demikian formulir ini diisi dengan sebenar-benarnya dan apabila terdapat ketidakbenaran dalam memenuhi kewajiban pengisian SPTPD ini, saya bersedia dikenakan sanksi sesuai dengan Peraturan Daerah yang berlaku.";
  const declarationLines = doc.splitTextToSize(declaration, width - 5);
  cell(left, y, width, 12, declarationLines.join(" "), { size: 6.5 }); y += 15;
  text("........................, tgl ........................", right - 60, y, 7);
  text("Petugas", left + 18, y + 8, 7, true); text("WP/Penanggung Pajak/Kuasa,", right - 58, y + 8, 7, true);
  text("................................", left + 5, y + 22, 7); text("................................", right - 56, y + 22, 7);
  text("NIP................................", left + 5, y + 27, 7); text("Nama Jelas/Cap/Stempel", right - 52, y + 27, 7);
  y += 33;
  text("Setoran dapat dilakukan ke Rek :", left, y, 7, true); text("1. BANK NAGARI Nomor : 2110.0101.00011-8    a.n : Rekening Umum Kas Daerah", left + 58, y, 6.5, true); text("2. BNI 46 Nomor : 235.888.23.66    a.n : Pemda Kabupaten Kepulauan Mentawai", left + 58, y + 5, 6.5, true);
  y += 12;
  cell(left, y, 25, 5, "Keterangan", { bold: true, size: 7 }); cell(left + 25, y, width - 25, 5, ":", { size: 7 }); y += 5;
  cell(left, y, 25, 5, "Lembar", { size: 7 }); cell(left + 25, y, 8, 5, "1", { align: "center", size: 7 }); cell(left + 33, y, width - 33, 5, "Badan Pendapatan Daerah", { size: 7 }); y += 5;
  cell(left, y, 25, 5); cell(left + 25, y, 8, 5, "2", { align: "center", size: 7 }); cell(left + 33, y, width - 33, 5, "Wajib Pajak", { size: 7 });
  text(`Dokumen: ${reference}`, left, pageHeight - 4, 6);
  doc.save(`${reference.replaceAll("/", "-")}.pdf`);
}

export function SptpdDetail({ record, onBack }: { record: SptpdPeriodRecord; onBack: () => void }) {
  const router = useRouter();
  const taxpayer = getTaxpayer(record.taxpayerId);
  if (!taxpayer) return null;
  const difference = record.mposAmount - record.reportedAmount;
  const statusClass = record.status === "Sudah Dilaporkan" ? "is-reported" : record.status === "Perlu Ditinjau" ? "is-review" : "is-missing";
  const reportDate = record.status === "Belum Dilaporkan" ? "Belum dilaporkan" : `20 ${record.period} ${record.year}`;
  const reference = `SPTPD/PBJT/${record.year}/${String(record.monthIndex + 25).padStart(4, "0")}`;
  return <div className="sptpd-detail-view"><button className="taxpayer-back" onClick={onBack}><ArrowLeft size={17} />Kembali</button><section className="sptpd-detail-hero"><header><div><p><FileText size={16} />SPTPD</p><h1>{reference}</h1><strong>{taxpayer.name}</strong><span>P.{taxpayer.id.replace("wp-", "")}.001</span></div><span className={`sptpd-status ${statusClass}`}><i />{record.status}</span></header><div className="sptpd-detail-meta"><div><span>Masa Pajak</span><strong>{record.period} {record.year}</strong></div><div><span>Tanggal Lapor</span><strong>{reportDate}</strong></div><div><span>Jenis Usaha</span><strong>{taxpayer.type}</strong></div><div><span>Kecamatan</span><strong>{taxpayer.district}</strong></div></div></section><div className="sptpd-detail-grid"><section className="sptpd-value-card"><h2>Nilai Pelaporan</h2><dl><div><dt>Omzet Dilaporkan</dt><dd>{formatRupiah(record.reportedAmount)}</dd></div><div><dt>Dasar Pengenaan</dt><dd>{formatRupiah(record.reportedAmount)}</dd></div><div><dt>Tarif PBJT</dt><dd>{mockConfig.pbjtRate * 100}%</dd></div><div className="sptpd-total-row"><dt>PBJT Dilaporkan</dt><dd>{formatRupiah(record.pbjtAmount)}</dd></div></dl></section><section className="sptpd-reconciliation-card"><h2>Rekonsiliasi MPOS vs SPTPD</h2><div className="sptpd-reconciliation-values"><div><span>Data MPOS</span><strong>{formatRupiah(record.mposAmount)}</strong></div><b>→</b><div><span>Data SPTPD</span><strong>{formatRupiah(record.reportedAmount)}</strong></div></div><div className={`sptpd-difference ${difference > 0 ? "has-difference" : "no-difference"}`}><span>Selisih Omzet</span><strong>{formatRupiah(difference)}</strong></div><p>Selisih merupakan indikasi untuk ditinjau, bukan otomatis berarti pelanggaran.</p></section></div><section className="sptpd-payment-card"><h2>Pembayaran Terkait</h2><div className="sptpd-payment-table"><div><span>REFERENSI</span><span>DIBAYAR</span><span>TANGGAL</span><span>METODE</span><span>STATUS</span></div><div><code>REF-{record.year}{String(record.monthIndex + 25).padStart(4, "0")}</code><strong>{formatRupiah(record.pbjtAmount)}</strong><span>{reportDate}</span><span><CreditCard size={15} />Tunai</span><span className="sptpd-status is-reported"><i />{record.status === "Belum Dilaporkan" ? "Belum Lunas" : "Lunas"}</span></div></div></section><div className="sptpd-detail-actions"><button className="primary-action" onClick={() => router.push("/dashboard#reconciliation")}>Lihat Rekonsiliasi</button><button className="secondary-action"><Building2 size={16} />Lihat WP</button><button className="secondary-action" onClick={() => void downloadSptpdPdf(record)}><CalendarDays size={16} />Download PDF</button></div></div>;
}

export function SptpdPrintView({ record }: { record: SptpdPeriodRecord }) {
  const taxpayer = getTaxpayer(record.taxpayerId);
  if (!taxpayer) return null;
  return <main className="sptpd-print-page"><section className="sptpd-print-form"><header className="sptpd-official-header"><Image src="/assets/branding/bapenda-mentawai.png" alt="Lambang dan kop BAPENDA Kabupaten Kepulauan Mentawai" width={650} height={80} unoptimized /><div><strong>PEMERINTAH KABUPATEN KEPULAUAN MENTAWAI</strong><span>TUAPEJAT - SIPORA</span><small>SURAT PEMBERITAHUAN PAJAK DAERAH</small><h1>SPTPD</h1><h2>{taxpayer.type === "Hotel" ? "PAJAK JASA PERHOTELAN" : "PBJT - MAKAN DAN/ATAU MINUMAN"}</h2><p>Masa Pajak: <b>{record.period} {record.year}</b></p></div></header><div className="sptpd-print-section"><h3>Data SPTPD</h3><p>{taxpayer.name} - {record.period} {record.year}</p><p>{formatRupiah(record.pbjtAmount)}</p></div></section></main>;
}
