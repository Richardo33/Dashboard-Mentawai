import { readFile } from "node:fs/promises";
import path from "node:path";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { generateSptpdPdf } from "@/features/sptpd/pdf/generate-sptpd-pdf";
import { renderSptpdHtml, type SptpdPdfData } from "@/features/sptpd/pdf/render-sptpd-html";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const periods = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) return NextResponse.json({ error: "Konfigurasi database belum tersedia." }, { status: 503 });

    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (items) => items.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    });
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return NextResponse.json({ error: "Sesi login tidak ditemukan." }, { status: 401 });

    const { id } = await params;
    const { data: record, error: recordError } = await supabase.from("sptpd_records").select("id, taxpayer_id, period_month, period_year, reported_amount, pbjt_amount, status").eq("id", id).maybeSingle();
    if (recordError || !record) return NextResponse.json({ error: "Data SPTPD tidak ditemukan." }, { status: 404 });
    const { data: taxpayer, error: taxpayerError } = await supabase.from("taxpayers").select("id, name, business_type, address, village, district, owner_contact, owner_email").eq("id", record.taxpayer_id).maybeSingle();
    if (taxpayerError || !taxpayer) return NextResponse.json({ error: "Data wajib pajak tidak ditemukan." }, { status: 404 });

    const logo = await readFile(path.join(process.cwd(), "public/assets/branding/bapenda-mentawai.png"));
    const data: SptpdPdfData = {
      reference: `SPTPD/PBJT/${record.period_year}/${String(record.period_month + 24).padStart(4, "0")}`,
      period: periods[record.period_month - 1] ?? "-",
      year: record.period_year,
      taxpayerName: taxpayer.name,
      businessType: taxpayer.business_type,
      address: taxpayer.address,
      village: taxpayer.village,
      district: taxpayer.district,
      ownerContact: taxpayer.owner_contact,
      ownerEmail: taxpayer.owner_email,
      npwpd: `P.${taxpayer.id.replace("wp-", "")}.001`,
      reportedAmount: Number(record.reported_amount),
      pbjtAmount: Number(record.pbjt_amount),
      reportStatus: record.status,
      logoDataUri: `data:image/png;base64,${logo.toString("base64")}`,
    };
    const pdf = await generateSptpdPdf(renderSptpdHtml(data));
    const filename = `${data.reference.replaceAll("/", "-")}.pdf`;
    return new Response(pdf, { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${filename}"`, "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("SPTPD PDF generation failed", error);
    return NextResponse.json({ error: "PDF SPTPD gagal dibuat. Silakan coba lagi." }, { status: 500 });
  }
}
