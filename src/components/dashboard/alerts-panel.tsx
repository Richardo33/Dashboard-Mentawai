import { AlertTriangle, ArrowRight } from "lucide-react";
import { getTaxpayer, mockAlerts, mockConfig } from "@/lib/mock-data";

export function AlertsPanel() {
  return (
    <section className="alerts-panel">
      <header className="alerts-header"><div><h2>Alert Terbaru</h2><p>{mockAlerts.length} notifikasi aktif</p></div><a href="#alerts">Alert Center <ArrowRight size={16} /></a></header>
      <div className="alerts-list">{mockAlerts.slice(0, 5).map((alert) => { const taxpayer = getTaxpayer(alert.taxpayerId); return <div className="alert-row" key={`${alert.type}-${alert.taxpayerId}`}><div className="alert-icon"><AlertTriangle size={18} /></div><div className="alert-copy"><strong>{alert.title}</strong><span>{taxpayer?.name} - {mockConfig.currentPeriod} {mockConfig.currentYear}</span></div><span className="alert-type">{alert.type}</span></div>; })}</div>
    </section>
  );
}
