import type { Metadata } from "next";
import { Geist, DM_Mono } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { BootSequence } from "@/components/layout/BootSequence";
import { NuqsAdapter } from "nuqs/adapters/next/app";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const dmMono = DM_Mono({
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SOC Security Intelligence Dashboard",
  description: "Real-time threat monitoring and intelligence platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${dmMono.variable} font-sans antialiased text-text-primary bg-bg-base min-h-screen flex`} suppressHydrationWarning>
        <BootSequence />
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-auto bg-bg-base">
            <NuqsAdapter>
              {children}
            </NuqsAdapter>
          </main>
        </div>
      </body>
    </html>
  );
}
