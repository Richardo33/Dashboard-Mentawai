export type SptpdPdfData = {
  reference: string;
  period: string;
  year: number;
  taxpayerName: string;
  businessType: "Hotel" | "Restoran";
  address: string;
  village: string;
  district: string;
  ownerContact: string;
  ownerEmail: string;
  npwpd: string;
  reportedAmount: number;
  pbjtAmount: number;
  reportStatus: string;
  logoDataUri: string;
};

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function money(value: number) {
  return `Rp. ${Math.max(0, value).toLocaleString("id-ID")}`;
}

function identityRow(number: string, label: string, value: string) {
  return `<tr><td class="identity-number">${escapeHtml(number)}</td><td>${escapeHtml(label)}</td><td class="colon">:</td><td>${escapeHtml(value)}</td></tr>`;
}

function paymentRow(number: string, label: string, value: string, strong = false) {
  return `<tr><td class="payment-number">${escapeHtml(number)}</td><td>${escapeHtml(label)}</td><td class="currency">Rp.</td><td class="money ${strong ? "strong" : ""}">${escapeHtml(value)}</td></tr>`;
}

export function renderSptpdHtml(data: SptpdPdfData) {
  const isHotel = data.businessType === "Hotel";
  const title = isHotel ? "PBJT - JASA PERHOTELAN" : "PBJT - MAKAN DAN/ATAU MINUMAN";
  const classification = isHotel
    ? "Klasifikasi Perhotelan : Hotel/Hostel/Vila/Resort/Penginapan*"
    : "Klasifikasi Usaha : Restoran/Bar/Pub/Cafe*";
  const address = `${data.address}, ${data.village}, Kecamatan ${data.district}`;
  const paid = data.reportStatus === "Belum Dilaporkan" ? 0 : data.pbjtAmount;

  return `<!doctype html>
<html lang="id"><head><meta charset="utf-8"><title>${escapeHtml(data.reference)}</title>
<style>
@page { size: A4 portrait; margin: 8mm; }
html, body { margin: 0; padding: 0; width: 100%; background: #fff; }
* { box-sizing: border-box; }
body { font-family: Arial, Helvetica, sans-serif; color: #000; }
.sptpd-page { width: 194mm; min-height: 281mm; font-size: 7.2pt; line-height: 1.18; }
.header { width: 100%; margin: 0 0 2.2mm; }
.official-header { display: block; width: 100%; height: auto; }
.top-form { width: 100%; margin-top: 2.2mm; border-collapse: collapse; table-layout: fixed; }
.top-form td { height: 21mm; border: 0.25mm solid #000; padding: 2mm; vertical-align: top; }
.top-form .form-title { width: 57%; }
.top-form .recipient { width: 43%; }
.top-form h2 { margin: 0 0 4mm; font-size: 9pt; }
.top-form h3 { margin: 0 0 3mm; font-size: 10pt; }
.top-form p { margin: 1mm 0; }
.attention { display: table; width: 100%; margin: 2mm 0 1.5mm; }
.attention-title { display: table-cell; width: 18mm; font-weight: 700; vertical-align: top; }
.attention-list { display: table-cell; vertical-align: top; }
.attention-row { display: table; width: 100%; margin-bottom: 0.8mm; }
.attention-row b, .attention-row span { display: table-cell; vertical-align: top; }
.attention-row b { width: 5mm; font-weight: 400; }
.section-title { margin-top: 1.5mm; padding: 1.2mm 1.5mm; border: 0.25mm solid #000; font-weight: 700; }
.sptpd-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
.sptpd-table td, .sptpd-table th { border: 0.25mm solid #000; padding: 1mm 1.4mm; vertical-align: top; }
.identity-table col:nth-child(1) { width: 7%; }.identity-table col:nth-child(2) { width: 27%; }.identity-table col:nth-child(3) { width: 4%; }.identity-table col:nth-child(4) { width: 62%; }
.identity-number, .payment-number { text-align: center; }
.colon { text-align: center; }
.subsection { padding: 1.2mm 1.5mm; border: 0.25mm solid #000; border-top: 0; font-weight: 700; }
.payment-table col:nth-child(1) { width: 10%; }.payment-table col:nth-child(2) { width: 64%; }.payment-table col:nth-child(3) { width: 8%; }.payment-table col:nth-child(4) { width: 18%; }
.payment-table td { padding-top: 0.8mm; padding-bottom: 0.8mm; }
.currency { text-align: center; }.money { text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; }.money.strong { font-weight: 700; }
.support-table col:first-child { width: 70%; }.support-table col:last-child { width: 30%; }.support-table td:last-child { text-align: center; }
.declaration { margin-top: 1.8mm; padding: 2mm; border: 0.25mm solid #000; line-height: 1.28; text-align: justify; }
.signature { display: table; width: 100%; table-layout: fixed; margin-top: 2mm; }
.signature-box { display: table-cell; width: 50%; height: 27mm; padding: 0 8mm; text-align: center; vertical-align: top; }
.signature-box > * { display: block; width: 100%; text-align: center; }
.signature .date { display: block; height: 4mm; text-align: center; padding-right: 0; }
.signature .date-spacer { visibility: hidden; }
.signature .role { display: block; margin-top: 3mm; font-weight: 700; }.signature .line { display: block; margin-top: 14mm; }.signature small { display: block; margin-top: 1mm; }
.footer { margin-top: 1mm; font-size: 6.4pt; }.footer p { margin: 0.8mm 0; }.bank-list { display: table; width: 100%; table-layout: fixed; margin: 0.5mm 0 1.5mm; }.bank-row { display: table-row; }.bank-row b, .bank-row span { display: table-cell; vertical-align: top; }.bank-row b { width: 7mm; text-align: right; padding-right: 1.5mm; }.footer-table { width: 100%; border-collapse: collapse; table-layout: fixed; }.footer-table td { border: 0.25mm solid #000; padding: 1mm; }.footer-table td:first-child { width: 22%; }
.document-number { margin-top: 1.2mm; text-align: right; font-size: 6.5pt; }
.avoid-break { break-inside: avoid; page-break-inside: avoid; }
</style></head><body><main class="sptpd-page">
<header class="header"><img class="official-header" src="${data.logoDataUri}" alt="Kop Badan Pendapatan Daerah Kabupaten Kepulauan Mentawai"></header>
<table class="top-form"><colgroup><col class="form-title"><col class="recipient"></colgroup><tr><td><h2>SURAT PEMBERITAHUAN PAJAK DAERAH (SPTPD)</h2><h3>${escapeHtml(title)}</h3><p>Masa Pajak : <b>${escapeHtml(data.period)}</b></p><p>Tahun Pajak : <b>${escapeHtml(data.year)}</b></p></td><td class="recipient"><b>Kepada Yth. Kepala Bapenda</b><br>Kabupaten Kepulauan Mentawai<br>di -<br><b>&nbsp;&nbsp;&nbsp;Tuapeijat</b></td></tr></table>
<section class="attention avoid-break"><b class="attention-title">Perhatian :</b><div class="attention-list"><div class="attention-row"><b>1.</b><span>Harap diisi dalam rangkap 2 dan ditulis dengan huruf CETAK.</span></div><div class="attention-row"><b>2.</b><span>Beri nomor pada kotak yang tersedia untuk jawaban yang diberikan.</span></div><div class="attention-row"><b>3.</b><span>Setelah diisi dan ditandatangani, harap diserahkan kembali kepada Unit Pelayanan Pemungutan Pajak Daerah dimana Wajib Pajak terdaftar, paling lambat tanggal 15 bulan berikutnya.</span></div><div class="attention-row"><b>4.</b><span>Keterlambatan Penyerahan SPTPD, dikenakan sanksi sesuai ketentuan yang berlaku.</span></div></div></section>
<section class="avoid-break"><div class="section-title">I. Identitas Wajib Pajak :</div><table class="sptpd-table identity-table"><colgroup><col><col><col><col></colgroup><tbody>${identityRow("1", "Nama Wajib Pajak", data.taxpayerName)}${identityRow("2", "Alamat Wajib Pajak", address)}${identityRow("", "", `Dusun ${data.village}    Desa ${data.village}    Kode Pos -`)}${identityRow("3", "Nama Objek/Usaha", data.taxpayerName)}${identityRow("4", "Alamat Objek/Usaha", address)}${identityRow("5", "NPWPD", data.npwpd)}${identityRow("6", "NOPD", "-")}${identityRow("7", "No Telepon / Hp / WA", data.ownerContact)}${identityRow("8", "Email", data.ownerEmail)}</tbody></table></section>
<section class="avoid-break"><div class="section-title">II. Diisi oleh Wajib Pajak :</div><div class="subsection">a) &nbsp; ${escapeHtml(classification)}</div><div class="subsection">b) &nbsp; Data Pembayaran</div><table class="sptpd-table payment-table"><colgroup><col><col><col><col></colgroup><tbody><tr><td colspan="4"><b>1) &nbsp; Pembayaran dari :</b></td></tr>${paymentRow("a)", isHotel ? "Pendapatan dari Persewaan Kamar" : "Pendapatan dari Makanan dan Minuman", money(data.reportedAmount))}${paymentRow("b)", isHotel ? "Pendapatan dari Service Charge di Kamar" : "Pendapatan dari Service Charge", money(0))}${paymentRow("c)", "Pendapatan Lain-Lain", money(0))}${paymentRow("2)", "Dasar Pengenaan Pajak (DPP)", money(data.reportedAmount), true)}${paymentRow("3)", "Pajak Terutang (TARIF x DPP)", money(data.pbjtAmount), true)}${paymentRow("4)", "Sanksi / Denda", money(0))}${paymentRow("5)", "Pajak Yang Telah Dibayar", money(paid))}${paymentRow("6)", "Pajak Kurang atau Lebih Bayar", money(0), true)}<tr><td>7)</td><td colspan="3">${escapeHtml(isHotel ? "PBJT Jasa Perhotelan" : "PBJT Jasa Makanan dan/atau Minuman")} kurang dibayar dilunasi tanggal ____-____-____ (dd-mm-yy)</td></tr></tbody></table></section>
<section class="avoid-break"><div class="section-title">III. Data Pendukung :</div><table class="sptpd-table support-table"><colgroup><col><col></colgroup><tbody><tr><td>1) Surat Setoran Pajak Daerah (SSPD)</td><td>Ada / Tidak ada *</td></tr><tr><td>2) Rekapitulasi Penjualan/Omzet</td><td>Ada / Tidak ada *</td></tr><tr><td>3) Rekapitulasi Penggunaan Bon/Bill</td><td>Ada / Tidak ada *</td></tr><tr><td>4) Rincian Data Transaksi Untuk Masa Pajak Yang Bersangkutan</td><td>Ada / Tidak ada *</td></tr></tbody></table></section>
<p class="declaration avoid-break">Demikian formulir ini diisi dengan sebenar-benarnya dan apabila terdapat ketidakbenaran dalam memenuhi kewajiban pengisian SPTPD ini, saya bersedia dikenakan sanksi sesuai dengan Peraturan Daerah yang berlaku.</p>
<section class="signature avoid-break"><div class="signature-box"><span class="date date-spacer">&nbsp;</span><span class="role">Petugas</span><span class="line">................................</span><small>NIP................................</small></div><div class="signature-box"><span class="date">........................, tgl ........................</span><span class="role">WP/Penanggung Pajak/Kuasa,</span><span class="line">................................</span><small>Nama Jelas/Cap/Stempel</small></div></section>
<footer class="footer"><p><b>Setoran dapat dilakukan ke Rek :</b></p><div class="bank-list"><div class="bank-row"><b>1.</b><span>BANK NAGARI Nomor : 2110.0101.00011-8 a.n. Rekening Umum Kas Daerah</span></div><div class="bank-row"><b>2.</b><span>BNI 46 Nomor : 235.888.23.66 a.n. Pemda Kabupaten Kepulauan Mentawai</span></div></div><table class="footer-table"><tr><td><b>Keterangan</b></td><td>:</td></tr><tr><td>Lembar</td><td>1 &nbsp; Badan Pendapatan Daerah<br>2 &nbsp; Wajib Pajak</td></tr></table><div class="document-number">Dokumen: ${escapeHtml(data.reference)}</div></footer>
</main></body></html>`;
}
