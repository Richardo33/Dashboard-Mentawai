"use client";

import { useState, type MouseEvent } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BellRing,
  Calculator,
  ClipboardList,
  FileText,
  GitCompareArrows,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  RadioTower,
  Scale,
  ShieldCheck,
  UsersRound,
  WalletCards,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SidebarItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  active?: boolean;
};

type SidebarGroup = {
  label: string;
  items: SidebarItem[];
};

const sidebarGroups: SidebarGroup[] = [
  { label: "Dashboard", items: [{ label: "Overview", href: "#overview", icon: LayoutDashboard, active: true }] },
  { label: "Wajib Pajak", items: [{ label: "Semua Wajib Pajak", href: "#taxpayers", icon: UsersRound }] },
  { label: "Transaksi", items: [{ label: "Semua Transaksi", href: "#transactions", icon: ClipboardList }, { label: "Aktivitas Transaksi", href: "#activity", icon: Activity }] },
  { label: "Monitoring PBJT", items: [{ label: "Estimasi PBJT", href: "#estimation", icon: Calculator }, { label: "Realisasi Pembayaran", href: "#realization", icon: WalletCards }, { label: "Rekonsiliasi", href: "#reconciliation", icon: Scale }, { label: "Selisih / Gap", href: "#gap", icon: GitCompareArrows }] },
  { label: "Kepatuhan Pajak", items: [{ label: "SPTPD", href: "#sptpd", icon: FileText }, { label: "STPD", href: "#stpd", icon: ShieldCheck }, { label: "Status Kepatuhan", href: "#compliance", icon: ShieldCheck }] },
  { label: "Monitoring", items: [{ label: "Alert Center", href: "#alerts", icon: BellRing }, { label: "Status MPOS", href: "#mpos", icon: RadioTower }] },
];

type SidebarProps = {
  mobileOpen: boolean;
  onMobileClose: () => void;
  activeHref: string;
};

export function Sidebar({ mobileOpen, onMobileClose, activeHref }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={cn("dashboard-sidebar", mobileOpen && "is-open", collapsed && "is-collapsed")}>
      <div className="dashboard-brand">
        <div className="dashboard-brand-icon"><Image src="/assets/branding/kabupaten-kepulauan-mentawai.png" alt="Logo Kabupaten Kepulauan Mentawai" width={42} height={42} priority /></div>
        <div className="sidebar-brand-copy"><strong>BAPENDA PBJT</strong><span>Kab. Kep. Mentawai</span></div>
        <button className="sidebar-close" onClick={onMobileClose} aria-label="Tutup menu"><X size={20} /></button>
      </div>

      <nav className="dashboard-nav" aria-label="Navigasi utama">
        {sidebarGroups.map((group) => (
          <div className="sidebar-group" key={group.label}>
            <p className="sidebar-group-label">{group.label}</p>
            {group.items.map((item) => {
              const Icon = item.icon;
              function handleNavigation(event: MouseEvent<HTMLAnchorElement>) {
                if (pathname !== "/dashboard") {
                  event.preventDefault();
                  router.push(`/dashboard${item.href}`);
                }
                onMobileClose();
              }
              return <a className={cn((item.href === activeHref || (!activeHref && item.active)) && "active")} href={item.href} key={item.label} title={collapsed ? item.label : undefined} onClick={handleNavigation}><Icon size={18} /><span className="sidebar-item-label">{item.label}</span></a>;
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-collapse" onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? "Perbesar sidebar" : "Minimalkan sidebar"} title={collapsed ? "Perbesar sidebar" : "Minimalkan sidebar"}>
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>
    </aside>
  );
}
