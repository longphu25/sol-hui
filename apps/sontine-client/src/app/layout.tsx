import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { fontClasses } from "../lib/fonts";
import { AppProviders } from "@/components/app-providers";
import { AuthGuard } from "@/components/auth/auth-guard";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sontine - Decentralized Tontine Platform",
  description: "A modern tontine platform built on Solana blockchain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={fontClasses.variable}>
      <body className={`${inter.variable} ${fontClasses.sans} antialiased`}>
        <AppProviders>
          <AuthGuard>
        {children}
          </AuthGuard>
        </AppProviders>
      </body>
    </html>
  );
}
