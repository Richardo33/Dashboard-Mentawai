"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { SptpdPrintView } from "@/components/dashboard/sptpd-detail";
import { getSptpdHistory, mockTaxpayers } from "@/lib/mock-data";

export default function SptpdPrintPage() {
  const params = useParams<{ id: string }>();
  const record = mockTaxpayers.flatMap((taxpayer) => getSptpdHistory(taxpayer.id)).find((item) => item.id === params.id);
  useEffect(() => { if (record) window.setTimeout(() => window.print(), 300); }, [record]);
  return record ? <SptpdPrintView record={record} /> : <main>Data SPTPD tidak ditemukan.</main>;
}
