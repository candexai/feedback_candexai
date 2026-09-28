import type { Metadata } from "next";
import { Ancizar_Serif, Cactus_Classical_Serif } from "next/font/google";
import "./globals.css";

const ancizar = Ancizar_Serif({
  subsets: ["latin"],
  variable: "--font-ancizar",
  display: "swap",
  adjustFontFallback: false,
});

const cactus = Cactus_Classical_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-cactus",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CandexAI feedback",
  description: "Share how CandexAI is working for your organization.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`light ${ancizar.variable} ${cactus.variable}`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
