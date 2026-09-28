export type BusinessType = "Restoran" | "Hotel";
export type MposStatus = "online" | "syncing" | "offline";
export type PaymentMethod = "QRIS" | "Kartu Debit" | "Tunai" | "Transfer Bank" | "Virtual Account";

export type Taxpayer = {
  id: string;
  name: string;
  type: BusinessType;
  district: string;
  districtCode: string;
  village: string;
  active: boolean;
  mposStatus: MposStatus;
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

export const mockConfig = {
  currentYear: 2026,
  currentPeriod: "September",
  pbjtRate: 0.1,
  stpdOutstanding: 13574400,
  lastUpdated: "23 September 2026, 13:42 WIB",
};

export const mockTaxpayers: Taxpayer[] = [
  { id: "wp-001", name: "Hotel Mentawai Resort", type: "Hotel", district: "Sipora Selatan", districtCode: "13.09.10", village: "Sioban", active: true, mposStatus: "online" },
  { id: "wp-002", name: "Sipora Beach Resort", type: "Hotel", district: "Sipora Selatan", districtCode: "13.09.10", village: "Tuapejat", active: true, mposStatus: "online" },
  { id: "wp-003", name: "Siberut Island Resort", type: "Hotel", district: "Siberut Barat", districtCode: "13.09.05", village: "Simalegi", active: true, mposStatus: "offline" },
  { id: "wp-004", name: "Mentawai Waves Lodge", type: "Hotel", district: "Siberut Utara", districtCode: "13.09.04", village: "Muara Sikabaluan", active: true, mposStatus: "online" },
  { id: "wp-005", name: "Pagai Surf Resort", type: "Hotel", district: "Pagai Selatan", districtCode: "13.09.10", village: "Malakopa", active: true, mposStatus: "syncing" },
  { id: "wp-006", name: "Mentawai Coffee House", type: "Restoran", district: "Sipora Utara", districtCode: "13.09.01", village: "Silaibu", active: true, mposStatus: "online" },
  { id: "wp-007", name: "Tuapejat Seafood", type: "Restoran", district: "Sipora Utara", districtCode: "13.09.01", village: "Betumonga", active: true, mposStatus: "online" },
  { id: "wp-008", name: "Mentawai Grille", type: "Restoran", district: "Siberut Selatan", districtCode: "13.09.03", village: "Maileppet", active: true, mposStatus: "online" },
  { id: "wp-009", name: "Pagai Beach Cafe", type: "Restoran", district: "Pagai Selatan", districtCode: "13.09.10", village: "Malakopa", active: true, mposStatus: "online" },
  { id: "wp-010", name: "Siberut Restaurant", type: "Restoran", district: "Siberut Barat Daya", districtCode: "13.09.06", village: "Katurei", active: false, mposStatus: "offline" },
];

export const mockTransactions: Transaction[] = [
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

export const mockSptpd: SptpdRecord[] = mockTaxpayers.map((taxpayer) => ({
  id: `sptpd-${taxpayer.id}`,
  taxpayerId: taxpayer.id,
  period: mockConfig.currentPeriod,
  year: mockConfig.currentYear,
  reported: false,
  reportedAmount: 0,
}));

export const monthLabels = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
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

export const mockAlerts = [
  { title: "SPTPD belum dilaporkan", taxpayerId: "wp-001", type: "SPTPD" },
  { title: "SPTPD belum dilaporkan", taxpayerId: "wp-002", type: "SPTPD" },
  { title: "SPTPD belum dilaporkan", taxpayerId: "wp-003", type: "SPTPD" },
  { title: "SPTPD belum dilaporkan", taxpayerId: "wp-004", type: "SPTPD" },
  { title: "SPTPD belum dilaporkan", taxpayerId: "wp-005", type: "SPTPD" },
  { title: "Selisih rekonsiliasi terdeteksi", taxpayerId: "wp-002", type: "REKONSILIASI" },
];

export const mockAnomalies = [
  ["MPOS Offline", "wp-003", "Threshold: Online", "Deteksi: Offline > 24 jam", "Bahaya"],
  ["MPOS Offline", "wp-010", "Threshold: Online", "Deteksi: Offline > 48 jam", "Bahaya"],
  ["Selisih Pelaporan", "wp-001", "Threshold: Selisih < 5%", "Deteksi: Selisih 20%", "Waspada"],
  ["Nominal di Bawah Threshold", "wp-007", "Threshold: >= Rp 5.000", "Deteksi: 3 transaksi < Rp 5.000", "Waspada"],
  ["Void Berulang", "wp-008", "Threshold: < 2 void/hari", "Deteksi: 5 void/hari", "Waspada"],
] as const;

export function formatRupiah(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

export function getTaxpayer(taxpayerId: string) {
  return mockTaxpayers.find((taxpayer) => taxpayer.id === taxpayerId);
}

export function getDashboardTotals() {
  const totalRevenue = mockTransactions.reduce((total, transaction) => total + transaction.amount, 0);
  const estimatedPbjt = Math.round(totalRevenue * mockConfig.pbjtRate);
  const reportedPbjt = mockSptpd.reduce((total, record) => total + record.reportedAmount, 0);
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
