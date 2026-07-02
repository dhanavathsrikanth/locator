import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";
import { Suspense } from "react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <nav className="w-full flex justify-center border-b border-border h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <Link href={"/"}>Locator</Link>
              <div className="hidden sm:flex gap-4 text-muted-foreground">
                <Link href="/convert" className="hover:text-foreground transition-colors">Convert</Link>
                <Link href="/batch" className="hover:text-foreground transition-colors">Batch</Link>
                <Link href="/api-docs" className="hover:text-foreground transition-colors">API</Link>
                <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
              </div>
            </div>
            <Suspense>
              <AuthButton />
            </Suspense>
          </div>
        </nav>
        <div className="flex-1 flex flex-col gap-20 max-w-5xl p-5 w-full">
          {children}
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <p className="text-muted-foreground">Locator</p>
          <ThemeSwitcher />
        </footer>
      </div>
    </main>
  );
}
