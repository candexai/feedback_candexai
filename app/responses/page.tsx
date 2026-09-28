import type { Metadata } from "next";
import Link from "next/link";
import { AdminDashboard } from "@/components/AdminDashboard";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "CandexAI feedback admin",
  robots: { index: false, follow: false },
};

export default function ResponsesPage() {
  return (
    <>
      <SiteHeader
        trailing={
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            Feedback form
          </Link>
        }
      />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
        <AdminDashboard />
      </main>
    </>
  );
}
