import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MergeCraft",
  description: "Infinite Alchemy Game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <body className={`${outfit.className} bg-slate-950 text-slate-100 overflow-hidden antialiased`}>
        {children}
      </body>
    </html>
  );
}
