import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { content } from "@/content";
import "./globals.css";

const font = Poppins({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-poppins", display: "swap" });

export const metadata: Metadata = {
  title: content.meta.title,
  description: content.meta.description,
  openGraph: { type: "website", siteName: content.brand, title: content.meta.title, description: content.meta.description },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={font.variable}>{children}</body></html>;
}
