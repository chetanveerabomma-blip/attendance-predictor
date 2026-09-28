import type { Metadata } from "next";
import "./globals.css";
import { SessionProviderWrapper } from "@/components/SessionProviderWrapper";
import { Marquee } from "@/components/nb/Marquee";
import { Navbar } from "@/components/nb/Navbar";
import { Footer } from "@/components/nb/Footer";

export const metadata: Metadata = {
  title: "Attendance Predictor | SRM Trichy School of EEE",
  description:
    "Official institutional attendance forecasting system for SRM Trichy School of EEE. Calculate remaining classes, bunk capacity, 75% detention line, and 90% recovery plans.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-nb-bg text-nb-ink antialiased">
        <SessionProviderWrapper>
          <Marquee />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
