import { FeedbackForm } from "@/components/FeedbackForm";
import { SiteHeader } from "@/components/SiteHeader";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
        <FeedbackForm />
      </main>
    </>
  );
}
