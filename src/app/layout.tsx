import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ReviewPilot — AI Review Responses for Salons & Med Spas",
  description:
    "Automatically respond to every Google review with AI. Built for salons and med spas. $49/month per location.",
  openGraph: {
    title: "ReviewPilot",
    description: "AI-powered Google review responses for salons & med spas.",
    type: "website",
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
