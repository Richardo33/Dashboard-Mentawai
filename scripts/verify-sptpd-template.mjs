import assert from "node:assert/strict";
import { renderSptpdHtml } from "../src/features/sptpd/pdf/render-sptpd-html.ts";

const html = renderSptpdHtml({
  reference: "SPTPD/PBJT/2026/0033",
  period: "September",
  year: 2026,
  taxpayerName: "WP <Test>",
  businessType: "Hotel",
  address: "Jl. Panjang untuk uji layout alamat tetap",
  village: "Tuapeijat",
  district: "Sipora Utara",
  ownerContact: "0812",
  ownerEmail: "test@example.com",
  npwpd: "P.001.001",
  reportedAmount: 1234567,
  pbjtAmount: 123457,
  reportStatus: "Sudah Dilaporkan",
  logoDataUri: "data:image/png;base64,AA==",
});

assert.match(html, /@page\s*\{\s*size: A4 portrait/);
assert.match(html, /WP &lt;Test&gt;/);
assert.match(html, /Rp\. 1\.234\.567/);
assert.match(html, /Jl\. Panjang untuk uji layout alamat tetap/);
assert.match(html, /class="sptpd-page"/);
assert.match(html, /SURAT PEMBERITAHUAN PAJAK DAERAH/);
console.log("SPTPD HTML template verification passed");
