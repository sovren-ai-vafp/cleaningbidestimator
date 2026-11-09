import type { Metadata } from "next";
import { Outfit, Work_Sans } from "next/font/google";
import { content } from "@/content";
import "./globals.css";

const heading = Outfit({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-outfit", display: "swap" });
const body = Work_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-work-sans", display: "swap" });

export const metadata: Metadata = {
  title: content.meta.title,
  description: content.meta.description,
  openGraph: { type: "website", siteName: content.brand, title: content.meta.title, description: content.meta.description },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${heading.variable} ${body.variable}`}><body>{children}</body></html>;
}
