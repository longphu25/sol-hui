import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { fontClasses } from "../lib/fonts";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sontine - Decentralized Tontine Platform",
  description: "A modern tontine platform built on Solana blockchain",
};

export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={fontClasses.variable}>
      <head />
      <body className={`${inter.variable} ${fontClasses.sans} antialiased`}>
        {children}
      </body>
    </html>
  );
}
