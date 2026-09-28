import Link from "next/link";

export function SiteHeader({
  trailing,
}: {
  trailing?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary font-heading text-base font-semibold text-primary-foreground">
            C
          </span>
          <span className="font-heading text-[22px] font-semibold leading-none tracking-tight text-foreground">
            CandexAI
          </span>
        </Link>
        {trailing}
      </div>
    </header>
  );
}
