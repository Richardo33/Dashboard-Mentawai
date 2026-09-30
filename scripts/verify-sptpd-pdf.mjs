import assert from "node:assert/strict";
import { generateSptpdPdf } from "../src/features/sptpd/pdf/generate-sptpd-pdf.ts";

const pdf = await generateSptpdPdf(`<!doctype html><style>@page{size:A4;margin:8mm}body{font-family:Arial}</style><main>SPTPD smoke test</main>`);
assert.equal(pdf.subarray(0, 5).toString(), "%PDF-");
assert.ok(pdf.length > 1000);
console.log(`SPTPD Chromium PDF verification passed (${pdf.length} bytes)`);
