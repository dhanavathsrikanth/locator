import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiKeysSection } from "./api-keys";
import { CodeSnippets } from "./code-snippets";

export const metadata = {
  title: "Dashboard — Locator",
  alternates: { canonical: "/dashboard" },
};

function startOfMonth() {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

async function DashboardContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [{ data: profile }, { data: usageLogs }, { data: apiKeys }] =
    await Promise.all([
      supabase.from("profiles").select("plan").eq("id", user.id).maybeSingle(),
      supabase
        .from("usage_logs")
        .select("rows_processed, created_at")
        .eq("user_id", user.id)
        .gte("created_at", startOfMonth())
        .order("created_at", { ascending: true }),
      supabase
        .from("api_keys")
        .select("id, label, created_at, revoked_at")
        .eq("user_id", user.id)
        .is("revoked_at", null)
        .order("created_at", { ascending: false }),
    ]);

  const plan = profile?.plan ?? "free";

  const dailyUsage: Record<string, number> = {};
  let totalUsage = 0;
  for (const log of usageLogs ?? []) {
    const day = log.created_at.slice(0, 10);
    dailyUsage[day] = (dailyUsage[day] ?? 0) + (log.rows_processed ?? 1);
    totalUsage += log.rows_processed ?? 1;
  }

  const maxDaily = Math.max(...Object.values(dailyUsage), 1);
  const days = Object.entries(dailyUsage);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Plan</CardTitle>
          <Badge variant="secondary" className="capitalize text-sm px-3 py-1">
            {plan}
          </Badge>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Paid plans coming soon
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold font-mono mb-6">
            {totalUsage.toLocaleString()}
          </p>
          {days.length > 0 ? (
            <div className="flex items-end gap-[3px] h-40">
              {days.map(([day, count]) => (
                <div
                  key={day}
                  className="flex-1 min-w-[4px] bg-primary/80 rounded-t hover:bg-primary transition-colors relative group"
                  style={{ height: `${(count / maxDaily) * 100}%` }}
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow whitespace-nowrap z-10">
                    {day}: {count.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              No usage yet this month
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
        </CardHeader>
        <CardContent>
          <ApiKeysSection keys={apiKeys ?? []} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Start</CardTitle>
          <p className="text-sm text-muted-foreground">
            Replace{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">
              YOUR_API_KEY
            </code>{" "}
            with your key
          </p>
        </CardHeader>
        <CardContent>
          <CodeSnippets />
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-8 max-w-5xl mx-auto p-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your account, API keys, and monitor usage.
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
