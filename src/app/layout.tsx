import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ReviewPilot — AI-Powered Google Review Responses",
  description:
    "Automatically respond to every Google review with AI. Approved by you, posted automatically. $49/month per location.",
  openGraph: {
    title: "ReviewPilot",
    description: "AI-powered Google review responses — approved by you, posted automatically.",
    type: "website",
  },
  other: {
    google: "notranslate",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
