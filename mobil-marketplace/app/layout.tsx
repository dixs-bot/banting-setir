import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Marketplace Mobil - Jual Beli Mobil Bekas dan Baru Terpercaya",
  description: "Platform jual beli mobil bekas dan baru terpercaya di Indonesia. Temukan mobil impian Anda dengan harga terbaik dari dealer resmi dan penjual terpercaya.",
  keywords: "jual mobil, beli mobil, mobil bekas, mobil baru, dealer mobil, marketplace mobil",
  openGraph: {
    title: "Marketplace Mobil - Jual Beli Mobil Bekas dan Baru",
    description: "Platform jual beli mobil bekas dan baru terpercaya di Indonesia",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
