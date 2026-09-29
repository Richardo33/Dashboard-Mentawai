import { supabase } from "@/lib/supabase/client";

export type BusinessType = "Restoran" | "Hotel";
export type MposStatus = "online" | "syncing" | "offline";
export type PaymentMethod = "QRIS" | "Kartu Debit" | "Tunai" | "Transfer Bank" | "Virtual Account";
export type AlertType = "SPTPD" | "REKONSILIASI" | "STPD" | "MPOS";
export type AlertLevel = "warning" | "critical";

export type Taxpayer = {
  id: string;
  name: string;
  type: BusinessType;
  district: string;
  districtCode: string;
  nib?: string;
  village: string;
  active: boolean;
  mposStatus: MposStatus;
  image: string;
  address: string;
  registeredDate: string;
  ownerName: string;
  ownerNpwp: string;
  ownerContact: string;
  ownerEmail: string;
};

export type AlertRecord = {
  id: string;
  title: string;
  taxpayerId: string;
  type: AlertType;
  level: AlertLevel;
  detail: string;
  time: string;
};

export type MposDevice = {
  id: string;
  taxpayerId: string;
  device: string;
  lastSync: string;
  transactionsToday: number;
  status: "Online" | "Syncing" | "Offline";
};

export type Transaction = {
  id: string;
  taxpayerId: string;
  date: string;
  time: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: "Paid" | "Pending";
};

export type SptpdRecord = {
  id: string;
  taxpayerId: string;
  period: string;
  year: number;
  reported: boolean;
  reportedAmount: number;
};

export type SptpdPeriodRecord = {
  id: string;
  taxpayerId: string;
  period: string;
  monthIndex: number;
  year: number;
  mposAmount: number;
  reportedAmount: number;
  pbjtAmount: number;
  status: "Sudah Dilaporkan" | "Perlu Ditinjau" | "Belum Dilaporkan";
};

export const mockConfig = {
  currentYear: 2026,
  currentPeriod: "September",
  pbjtRate: 0.1,
  stpdOutstanding: 13574400,
  lastUpdated: "23 September 2026, 13:42 WIB",
  demoEmail: "admin@gmail.com",
  demoPassword: "Mentawai123!",
};

export const mockTaxpayers: Taxpayer[] = [
  { id: "wp-001", name: "Hotel Mentawai Resort", type: "Hotel", district: "Sipora Selatan", districtCode: "13.09.10", village: "Sioban", active: true, mposStatus: "online", image: "/assets/taxpayers/hotel-mentawai-resort.webp", address: "Jl. Pantai Tuapejat", registeredDate: "15 Jan 2024", ownerName: "Pak Andri", ownerNpwp: "01.234.567.0-001.000", ownerContact: "081234500001", ownerEmail: "andri@gmail.com" },
  { id: "wp-002", name: "Sipora Beach Resort", type: "Hotel", district: "Sipora Selatan", districtCode: "13.09.10", village: "Tuapejat", active: true, mposStatus: "online", image: "/assets/taxpayers/sipora-beach-resort.webp", address: "Jl. Pantai Sioban", registeredDate: "10 Feb 2024", ownerName: "Bu Meri", ownerNpwp: "02.345.678.0-002.000", ownerContact: "081234500002", ownerEmail: "meri@gmail.com" },
  { id: "wp-003", name: "Siberut Island Resort", type: "Hotel", district: "Siberut Barat", districtCode: "13.09.05", village: "Simalegi", active: true, mposStatus: "offline", image: "/assets/taxpayers/siberut-island-resort.webp", address: "Jl. Pantai Siberut", registeredDate: "18 Feb 2024", ownerName: "Pak Rudi", ownerNpwp: "03.456.789.0-003.000", ownerContact: "081234500003", ownerEmail: "rudi@gmail.com" },
  { id: "wp-004", name: "Mentawai Waves Lodge", type: "Hotel", district: "Siberut Utara", districtCode: "13.09.04", village: "Muara Sikabaluan", active: true, mposStatus: "online", image: "/assets/taxpayers/mentawai-waves-lodge.webp", address: "Jl. Pantai Tuapejat", registeredDate: "15 Jan 2024", ownerName: "Pengelola Mentawai Waves Lodge", ownerNpwp: "04.567.890.0-004.000", ownerContact: "081234500004", ownerEmail: "waves@gmail.com" },
  { id: "wp-005", name: "Pagai Surf Resort", type: "Hotel", district: "Pagai Selatan", districtCode: "13.09.10", village: "Malakopa", active: true, mposStatus: "syncing", image: "/assets/taxpayers/pagai-surf-resort.webp", address: "Jl. Pantai Pagai", registeredDate: "20 Jan 2024", ownerName: "Bu Sinta", ownerNpwp: "05.678.901.0-005.000", ownerContact: "081234500005", ownerEmail: "sinta@gmail.com" },
  { id: "wp-006", name: "Mentawai Coffee House", type: "Restoran", district: "Sipora Utara", districtCode: "13.09.01", village: "Silaibu", active: true, mposStatus: "online", image: "/assets/taxpayers/mentawai-coffee-house.webp", address: "Jl. Raya Silaibu", registeredDate: "22 Mar 2024", ownerName: "Bu Sari", ownerNpwp: "06.789.012.0-006.000", ownerContact: "081234500006", ownerEmail: "sari@gmail.com" },
  { id: "wp-007", name: "Tuapejat Seafood", type: "Restoran", district: "Sipora Utara", districtCode: "13.09.01", village: "Betumonga", active: true, mposStatus: "online", image: "/assets/taxpayers/tuapejat-seafood.webp", address: "Jl. Pelabuhan Tuapejat", registeredDate: "2 Apr 2024", ownerName: "Pak Dedi", ownerNpwp: "07.890.123.0-007.000", ownerContact: "081234500007", ownerEmail: "dedi@gmail.com" },
  { id: "wp-008", name: "Mentawai Grille", type: "Restoran", district: "Siberut Selatan", districtCode: "13.09.03", village: "Maileppet", active: true, mposStatus: "online", image: "/assets/taxpayers/mentawai-grille.webp", address: "Jl. Raya Maileppet", registeredDate: "12 Apr 2024", ownerName: "Bu Rina", ownerNpwp: "08.901.234.0-008.000", ownerContact: "081234500008", ownerEmail: "rina@gmail.com" },
  { id: "wp-009", name: "Pagai Beach Cafe", type: "Restoran", district: "Pagai Selatan", districtCode: "13.09.10", village: "Malakopa", active: true, mposStatus: "online", image: "/assets/taxpayers/pagai-beach-cafe.webp", address: "Jl. Pantai Malakopa", registeredDate: "16 Apr 2024", ownerName: "Pak Yanto", ownerNpwp: "09.012.345.0-009.000", ownerContact: "081234500009", ownerEmail: "yanto@gmail.com" },
  { id: "wp-010", name: "Siberut Restaurant", type: "Restoran", district: "Siberut Barat Daya", districtCode: "13.09.06", village: "Katurei", active: false, mposStatus: "offline", image: "/assets/taxpayers/siberut-restaurant.webp", address: "Jl. Raya Katurei", registeredDate: "25 Apr 2024", ownerName: "Pak Beni", ownerNpwp: "10.123.456.0-010.000", ownerContact: "081234500010", ownerEmail: "beni@gmail.com" },
];

const seedTransactions: Transaction[] = [
  { id: "INV-2026-00018", taxpayerId: "wp-001", date: "2026-09-18", time: "18.15", amount: 33660000, paymentMethod: "Kartu Debit", status: "Paid" },
  { id: "INV-2026-00036", taxpayerId: "wp-002", date: "2026-09-18", time: "09.22", amount: 27225000, paymentMethod: "QRIS", status: "Paid" },
  { id: "INV-2026-00054", taxpayerId: "wp-003", date: "2026-09-18", time: "10.29", amount: 22770000, paymentMethod: "Virtual Account", status: "Paid" },
  { id: "INV-2026-00072", taxpayerId: "wp-004", date: "2026-09-18", time: "11.36", amount: 31680000, paymentMethod: "Transfer Bank", status: "Paid" },
  { id: "INV-2026-00090", taxpayerId: "wp-005", date: "2026-09-18", time: "12.43", amount: 21780000, paymentMethod: "Tunai", status: "Paid" },
  { id: "INV-2026-00108", taxpayerId: "wp-007", date: "2026-09-18", time: "13.50", amount: 12870000, paymentMethod: "Kartu Debit", status: "Paid" },
  { id: "INV-2026-00126", taxpayerId: "wp-006", date: "2026-09-18", time: "14.57", amount: 7920000, paymentMethod: "QRIS", status: "Paid" },
  { id: "INV-2026-00144", taxpayerId: "wp-010", date: "2026-09-18", time: "15.04", amount: 9900000, paymentMethod: "Virtual Account", status: "Paid" },
  { id: "INV-2026-00161", taxpayerId: "wp-009", date: "2026-09-18", time: "16.40", amount: 10285000, paymentMethod: "Virtual Account", status: "Paid" },
  { id: "INV-2026-00162", taxpayerId: "wp-009", date: "2026-09-18", time: "16.11", amount: 8415000, paymentMethod: "Transfer Bank", status: "Paid" },
  { id: "INV-2026-00179", taxpayerId: "wp-008", date: "2026-09-18", time: "16.47", amount: 16335000, paymentMethod: "Transfer Bank", status: "Paid" },
  { id: "INV-2026-00180", taxpayerId: "wp-008", date: "2026-09-18", time: "17.18", amount: 13365000, paymentMethod: "Tunai", status: "Paid" },
  { id: "INV-2026-00181", taxpayerId: "wp-001", date: "2026-08-18", time: "16.20", amount: 24800000, paymentMethod: "QRIS", status: "Paid" },
  { id: "INV-2026-00182", taxpayerId: "wp-002", date: "2026-08-18", time: "15.50", amount: 17900000, paymentMethod: "Kartu Debit", status: "Paid" },
  { id: "INV-2026-00183", taxpayerId: "wp-004", date: "2026-07-18", time: "14.10", amount: 20100000, paymentMethod: "Transfer Bank", status: "Paid" },
  { id: "INV-2026-00184", taxpayerId: "wp-005", date: "2026-07-18", time: "13.40", amount: 14500000, paymentMethod: "Tunai", status: "Paid" },
  { id: "INV-2026-00185", taxpayerId: "wp-006", date: "2026-06-18", time: "12.30", amount: 11400000, paymentMethod: "QRIS", status: "Paid" },
  { id: "INV-2026-00186", taxpayerId: "wp-007", date: "2026-05-18", time: "11.20", amount: 9800000, paymentMethod: "Kartu Debit", status: "Pending" },
  { id: "INV-2026-00187", taxpayerId: "wp-008", date: "2026-04-18", time: "10.10", amount: 8700000, paymentMethod: "Tunai", status: "Paid" },
  { id: "INV-2026-00188", taxpayerId: "wp-009", date: "2026-03-18", time: "09.30", amount: 59595000, paymentMethod: "QRIS", status: "Paid" },
];

const generatedTransactions: Transaction[] = [2025, 2026].flatMap((year) => {
  const monthCount = year === mockConfig.currentYear ? 9 : 12;
  return mockTaxpayers.flatMap((taxpayer, taxpayerIndex) => Array.from({ length: monthCount * 8 }, (_, transactionIndex) => {
    const month = Math.floor(transactionIndex / 8);
    const sequence = transactionIndex % 8;
    const baseAmount = taxpayer.type === "Hotel" ? 5800000 : 2400000;
    const variation = (taxpayerIndex * 731000 + month * 421000 + sequence * 183000 + (year === 2025 ? 90000 : 0)) % 8000000;
    const day = 2 + ((taxpayerIndex * 3 + month * 2 + sequence * 4) % 24);
    const hour = 8 + ((sequence * 2 + taxpayerIndex) % 11);
    const minute = (sequence * 7 + taxpayerIndex * 3) % 60;
    const invoiceNumber = String(taxpayerIndex * 1000 + month * 8 + sequence + 2000).padStart(6, "0");
    return {
      id: `INV-${year}-${invoiceNumber}`,
      taxpayerId: taxpayer.id,
      date: `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      time: `${String(hour).padStart(2, "0")}.${String(minute).padStart(2, "0")}`,
      amount: baseAmount + variation,
      paymentMethod: ["QRIS", "Kartu Debit", "Tunai", "Transfer Bank", "Virtual Account"][sequence % 5] as PaymentMethod,
      status: sequence === 7 && month % 3 === 0 ? "Pending" : "Paid",
    };
  }));
});

export const mockTransactions: Transaction[] = [...seedTransactions, ...generatedTransactions];

export const mockSptpd: SptpdRecord[] = mockTaxpayers.map((taxpayer) => ({
  id: `sptpd-${taxpayer.id}`,
  taxpayerId: taxpayer.id,
  period: mockConfig.currentPeriod,
  year: mockConfig.currentYear,
  reported: false,
  reportedAmount: 0,
}));

export const monthLabels = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
export const monthLabelsLong = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

export function getSptpdHistory(taxpayerId: string, year = mockConfig.currentYear): SptpdPeriodRecord[] {
  const monthCount = year === mockConfig.currentYear ? 9 : 12;
  return Array.from({ length: monthCount }, (_, monthIndex) => {
    const mposAmount = mockTransactions.filter((transaction) => {
      const date = new Date(transaction.date);
      return transaction.taxpayerId === taxpayerId && date.getFullYear() === year && date.getMonth() === monthIndex;
    }).reduce((sum, transaction) => sum + transaction.amount, 0);
    const isCurrentPeriod = year === mockConfig.currentYear && monthIndex === 8;
    const isReviewPeriod = year === mockConfig.currentYear && monthIndex === 7;
    const reportedAmount = isCurrentPeriod ? 0 : isReviewPeriod ? Math.round(mposAmount * 0.8) : mposAmount;
    const status = isCurrentPeriod ? "Belum Dilaporkan" : reportedAmount < mposAmount ? "Perlu Ditinjau" : "Sudah Dilaporkan";
    return {
      id: `sptpd-${taxpayerId}-${year}-${String(monthIndex + 1).padStart(2, "0")}`,
      taxpayerId,
      period: monthLabelsLong[monthIndex],
      monthIndex,
      year,
      mposAmount,
      reportedAmount,
      pbjtAmount: Math.round(reportedAmount * mockConfig.pbjtRate),
      status,
    };
  });
}
export const mockMonthlySeries = {
  2026: {
    estimate: [25, 23, 28, 32, 35, 38, 42, 45, 40, null, null, null],
    realization: [25, 23, 28, 32, 35, 37, 41, 44, null, null, null, null],
  },
  2025: {
    estimate: [20, 22, 25, 27, 30, 31, 34, 36, 38, 40, 42, 45],
    realization: [19, 21, 24, 26, 29, 30, 33, 35, 36, 38, 40, 43],
  },
} as const;

export const mockAlerts: AlertRecord[] = [
  { id: "sptpd-001", title: "SPTPD belum dilaporkan", taxpayerId: "wp-001", type: "SPTPD", level: "warning", detail: "September 2026", time: "28 Sep 2026 · 18.13.34" },
  { id: "sptpd-002", title: "SPTPD belum dilaporkan", taxpayerId: "wp-002", type: "SPTPD", level: "warning", detail: "September 2026", time: "28 Sep 2026 · 17.13.34" },
  { id: "sptpd-003", title: "SPTPD belum dilaporkan", taxpayerId: "wp-003", type: "SPTPD", level: "warning", detail: "September 2026", time: "28 Sep 2026 · 16.13.34" },
  { id: "sptpd-004", title: "SPTPD belum dilaporkan", taxpayerId: "wp-004", type: "SPTPD", level: "warning", detail: "September 2026", time: "28 Sep 2026 · 15.13.34" },
  { id: "sptpd-005", title: "SPTPD belum dilaporkan", taxpayerId: "wp-005", type: "SPTPD", level: "warning", detail: "September 2026", time: "28 Sep 2026 · 14.13.34" },
  { id: "rek-001", title: "Selisih rekonsiliasi terdeteksi", taxpayerId: "wp-006", type: "REKONSILIASI", level: "warning", detail: "selisih omzet Rp 6.000.000", time: "28 Sep 2026 · 13.13.34" },
  { id: "rek-002", title: "Selisih rekonsiliasi terdeteksi", taxpayerId: "wp-005", type: "REKONSILIASI", level: "warning", detail: "selisih omzet Rp 0", time: "28 Sep 2026 · 12.13.34" },
  { id: "stpd-001", title: "STPD belum diselesaikan", taxpayerId: "wp-001", type: "STPD", level: "critical", detail: "sisa Rp 5.656.000", time: "28 Sep 2026 · 10.13.34" },
  { id: "stpd-002", title: "STPD belum diselesaikan", taxpayerId: "wp-003", type: "STPD", level: "critical", detail: "sisa Rp 4.444.000", time: "28 Sep 2026 · 09.13.34" },
  { id: "stpd-003", title: "STPD belum diselesaikan", taxpayerId: "wp-009", type: "STPD", level: "critical", detail: "sisa Rp 2.424.000", time: "28 Sep 2026 · 08.13.34" },
  { id: "stpd-004", title: "STPD belum diselesaikan", taxpayerId: "wp-009", type: "STPD", level: "critical", detail: "sisa Rp 2.020.000", time: "28 Sep 2026 · 07.13.34" },
  { id: "mpos-001", title: "MPOS offline terdeteksi", taxpayerId: "wp-003", type: "MPOS", level: "critical", detail: "offline lebih dari 24 jam", time: "28 Sep 2026 · 06.13.34" },
  { id: "mpos-002", title: "MPOS belum tersinkronisasi", taxpayerId: "wp-010", type: "MPOS", level: "warning", detail: "sinkronisasi terakhir tidak tersedia", time: "28 Sep 2026 · 05.13.34" },
];

export const mockMposDevices: MposDevice[] = [
  { id: "device-001", taxpayerId: "wp-001", device: "MPOS-A1-101", lastSync: "13.30.00", transactionsToday: 12, status: "Online" },
  { id: "device-002", taxpayerId: "wp-002", device: "MPOS-A1-102", lastSync: "13.28.00", transactionsToday: 8, status: "Online" },
  { id: "device-003", taxpayerId: "wp-003", device: "MPOS-B2-201", lastSync: "08.12.00", transactionsToday: 0, status: "Offline" },
  { id: "device-004", taxpayerId: "wp-004", device: "MPOS-C3-301", lastSync: "13.35.00", transactionsToday: 15, status: "Online" },
  { id: "device-005", taxpayerId: "wp-005", device: "MPOS-D4-401", lastSync: "11.50.00", transactionsToday: 6, status: "Syncing" },
  { id: "device-006", taxpayerId: "wp-006", device: "MPOS-A1-103", lastSync: "13.32.00", transactionsToday: 22, status: "Online" },
  { id: "device-007", taxpayerId: "wp-007", device: "MPOS-A1-104", lastSync: "13.20.00", transactionsToday: 18, status: "Online" },
  { id: "device-008", taxpayerId: "wp-008", device: "MPOS-B2-202", lastSync: "14.00.00", transactionsToday: 0, status: "Offline" },
  { id: "device-009", taxpayerId: "wp-009", device: "MPOS-A1-105", lastSync: "13.10.00", transactionsToday: 14, status: "Online" },
  { id: "device-010", taxpayerId: "wp-010", device: "MPOS-A1-106", lastSync: "13.40.00", transactionsToday: 20, status: "Online" },
];

export const mockStpdSeeds: Array<{ taxpayerId: string; monthIndex: number; status: string; paidRate: number }> = [
  { taxpayerId: "wp-001", monthIndex: 6, status: "Overdue", paidRate: 0 },
  { taxpayerId: "wp-003", monthIndex: 5, status: "Overdue", paidRate: 0 },
  { taxpayerId: "wp-009", monthIndex: 6, status: "Partial", paidRate: .4 },
  { taxpayerId: "wp-009", monthIndex: 7, status: "Outstanding", paidRate: 0 },
];

export const mockAnomalies: Array<[string, string, string, string, string]> = [
  ["MPOS Offline", "wp-003", "Threshold: Online", "Deteksi: Offline > 24 jam", "Bahaya"],
  ["MPOS Offline", "wp-010", "Threshold: Online", "Deteksi: Offline > 48 jam", "Bahaya"],
  ["Selisih Pelaporan", "wp-001", "Threshold: Selisih < 5%", "Deteksi: Selisih 20%", "Waspada"],
  ["Nominal di Bawah Threshold", "wp-007", "Threshold: >= Rp 5.000", "Deteksi: 3 transaksi < Rp 5.000", "Waspada"],
  ["Void Berulang", "wp-008", "Threshold: < 2 void/hari", "Deteksi: 5 void/hari", "Waspada"],
];

function replaceCollection<T>(target: T[], rows: T[]) {
  target.splice(0, target.length, ...rows);
}

export function clearDashboardData() {
  replaceCollection(mockTaxpayers, []);
  replaceCollection(mockTransactions, []);
  replaceCollection(mockSptpd, []);
  replaceCollection(mockAlerts, []);
  replaceCollection(mockMposDevices, []);
  replaceCollection(mockStpdSeeds, []);
  replaceCollection(mockAnomalies, []);
}

export async function syncDashboardData() {
  if (!supabase) throw new Error("Supabase environment variables are missing.");
  const results = await Promise.all([
    supabase.from("taxpayers").select("*").order("id"),
    supabase.from("transactions").select("*").order("transaction_date", { ascending: false }),
    supabase.from("sptpd_records").select("*").order("period_year", { ascending: false }).order("period_month", { ascending: false }),
    supabase.from("mpos_devices").select("*").order("id"),
    supabase.from("stpd_records").select("*").order("due_date"),
    supabase.from("alerts").select("*").order("alert_time", { ascending: false }),
  ]);
  const failed = results.find((item) => item.error);
  if (failed?.error) throw failed.error;
  const [taxpayersResult, transactionsResult, sptpdResult, devicesResult, stpdResult, alertsResult] = results;

  const taxpayers = (taxpayersResult.data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    type: row.business_type,
    district: row.district,
    districtCode: row.district_code,
    nib: row.nib ?? "",
    village: row.village,
    active: row.active,
    mposStatus: row.mpos_status,
    image: row.image_path ? "/assets/taxpayers/" + row.image_path : "/assets/taxpayers/mentawai-resort.webp",
    address: row.address,
    registeredDate: new Date(row.registered_date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }),
    ownerName: row.owner_name,
    ownerNpwp: row.owner_npwp,
    ownerContact: row.owner_contact,
    ownerEmail: row.owner_email,
  } satisfies Taxpayer));
  const transactions = (transactionsResult.data ?? []).map((row) => ({
    id: row.id,
    taxpayerId: row.taxpayer_id,
    date: row.transaction_date,
    time: row.transaction_time,
    amount: Number(row.amount),
    paymentMethod: row.payment_method,
    status: row.status,
  } satisfies Transaction));
  const sptpd = (sptpdResult.data ?? []).filter((row) => row.period_year === mockConfig.currentYear && row.period_month === 9).map((row) => ({
    id: row.id,
    taxpayerId: row.taxpayer_id,
    period: mockConfig.currentPeriod,
    year: row.period_year,
    reported: row.status === "Sudah Dilaporkan",
    reportedAmount: Number(row.reported_amount),
  } satisfies SptpdRecord));
  const devices = (devicesResult.data ?? []).map((row) => ({
    id: row.id,
    taxpayerId: row.taxpayer_id,
    device: row.device,
    lastSync: row.last_sync,
    transactionsToday: row.transactions_today,
    status: row.status,
  } satisfies MposDevice));
  const stpd = (stpdResult.data ?? []).map((row) => ({
    taxpayerId: row.taxpayer_id,
    monthIndex: row.period_month - 1,
    status: row.status,
    paidRate: row.total ? Number(row.paid) / Number(row.total) : 0,
  }));
  const alerts = (alertsResult.data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    taxpayerId: row.taxpayer_id,
    type: row.type,
    level: row.level,
    detail: row.detail,
    time: new Date(row.alert_time).toLocaleString("id-ID"),
  } satisfies AlertRecord));

  replaceCollection(mockTaxpayers, taxpayers);
  replaceCollection(mockTransactions, transactions);
  replaceCollection(mockSptpd, sptpd);
  replaceCollection(mockMposDevices, devices);
  replaceCollection(mockStpdSeeds, stpd);
  replaceCollection(mockAlerts, alerts);
  replaceCollection(mockAnomalies, []);
  mockConfig.stpdOutstanding = (stpdResult.data ?? []).reduce((sum, row) => sum + Number(row.remaining), 0);
}

export function formatRupiah(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

export function getTaxpayer(taxpayerId: string) {
  return mockTaxpayers.find((taxpayer) => taxpayer.id === taxpayerId);
}

export function getDashboardTotals() {
  const totalRevenue = mockTransactions.reduce((total, transaction) => total + transaction.amount, 0);
  const estimatedPbjt = Math.round(totalRevenue * mockConfig.pbjtRate);
  const reportedPbjt = mockSptpd.reduce((total, record) => total + Math.round(record.reportedAmount * mockConfig.pbjtRate), 0);
  return {
    totalTaxpayers: mockTaxpayers.length,
    activeTaxpayers: mockTaxpayers.filter((taxpayer) => taxpayer.active).length,
    totalTransactions: mockTransactions.length,
    totalRevenue,
    estimatedPbjt,
    reportedPbjt,
    gap: estimatedPbjt - reportedPbjt,
    reportedSptpd: mockSptpd.filter((record) => record.reported).length,
    connectedMpos: mockTaxpayers.filter((taxpayer) => taxpayer.mposStatus !== "offline").length,
    pendingTransactions: mockTransactions.filter((transaction) => transaction.status === "Pending").length,
  };
}

export function getSectorRevenue() {
  return mockTaxpayers.reduce<Record<BusinessType, number>>((totals, taxpayer) => {
    totals[taxpayer.type] += mockTransactions.filter((transaction) => transaction.taxpayerId === taxpayer.id).reduce((sum, transaction) => sum + transaction.amount, 0);
    return totals;
  }, { Restoran: 0, Hotel: 0 });
}

export function getMposStatusTotals() {
  return mockTaxpayers.reduce<Record<MposStatus, number>>((totals, taxpayer) => {
    totals[taxpayer.mposStatus] += 1;
    return totals;
  }, { online: 0, syncing: 0, offline: 0 });
}

export function getDistricts() {
  const districts = Array.from(new Set(mockTaxpayers.map((taxpayer) => taxpayer.district)));
  return districts.map((district) => {
    const members = mockTaxpayers.filter((taxpayer) => taxpayer.district === district);
    const villages = Array.from(new Set(members.map((taxpayer) => taxpayer.village)));
    const code = members[0]?.districtCode ?? "13.09";
    return { name: district, code, villages, taxpayerCount: members.length, filledVillages: villages.length };
  });
}
