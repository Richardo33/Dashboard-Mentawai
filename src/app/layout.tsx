import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dashboard Mentawai | Sistem Monitoring PBJT Terpadu",
  description: "Portal monitoring PBJT Kabupaten Kepulauan Mentawai.",
  icons: {
    icon: "/assets/branding/kabupaten-kepulauan-mentawai.png",
    shortcut: "/assets/branding/kabupaten-kepulauan-mentawai.png",
    apple: "/assets/branding/kabupaten-kepulauan-mentawai.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
