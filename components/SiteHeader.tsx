import Link from "next/link";

export function SiteHeader({
  trailing,
  wide = false,
}: {
  trailing?: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur">
      <div className={`mx-auto flex h-16 items-center justify-between px-4 ${wide ? "max-w-6xl" : "max-w-3xl"}`}>
        <Link href="/" className="flex items-center">
          <img src="/candexai-logo.jpg" alt="CandexAI" className="h-10 w-auto sm:h-12" />
        </Link>
        {trailing}
      </div>
    </header>
  );
}
