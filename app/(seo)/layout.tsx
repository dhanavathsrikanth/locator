import Link from "next/link";

export default function SeoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="w-full border-b border-border">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
          <Link href="/" className="font-semibold">
            GeoBatch
          </Link>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/convert" className="hover:text-foreground transition-colors">
              Convert
            </Link>
            <Link href="/batch" className="hover:text-foreground transition-colors">
              Batch
            </Link>
            <Link href="/api-docs" className="hover:text-foreground transition-colors">
              API
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="w-full border-t border-border py-8 text-center text-xs text-muted-foreground">
        <p>GeoBatch — Free Geocoding API &amp; Coordinate Conversion Tools</p>
      </footer>
    </div>
  );
}
