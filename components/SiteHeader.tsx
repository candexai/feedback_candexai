import Link from "next/link";

export function SiteHeader({
  trailing,
}: {
  trailing?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center">
          <img src="/candexai-logo.jpg" alt="CandexAI" className="h-10 w-auto sm:h-12" />
        </Link>
        {trailing}
      </div>
    </header>
  );
}
