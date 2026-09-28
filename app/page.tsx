import Link from "next/link";
import { FeedbackForm } from "@/components/FeedbackForm";
import { SiteHeader } from "@/components/SiteHeader";

export default function HomePage() {
  return (
    <>
      <SiteHeader
        trailing={
          <Link href="/responses" className="text-sm text-muted-foreground hover:text-foreground">
            Admin
          </Link>
        }
      />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
        <FeedbackForm />
      </main>
    </>
  );
}
