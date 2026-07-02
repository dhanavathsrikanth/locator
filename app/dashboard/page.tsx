import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Dashboard — Locator",
};

async function DashboardContent() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-semibold mb-2">Account</h2>
        <p className="text-sm text-muted-foreground">
          Signed in as{" "}
          <span className="font-mono text-foreground">{user.email}</span>
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Plan</p>
          <p className="text-xl font-bold mt-1">Free</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">API Calls</p>
          <p className="text-xl font-bold mt-1 font-mono">0</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Coordinates</p>
          <p className="text-xl font-bold mt-1 font-mono">0</p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
        Dashboard analytics coming soon
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-8 max-w-5xl mx-auto p-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Your usage, API keys, and account overview.
        </p>
      </div>
      <Suspense
        fallback={
          <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
            Loading dashboard...
          </div>
        }
      >
        <DashboardContent />
      </Suspense>
    </div>
  );
}
