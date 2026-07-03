import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Location — Locator",
  alternates: { canonical: "/my-location" },
};

import Link from "next/link";

export default function MyLocationPage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-8 max-w-5xl mx-auto p-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">My Location</h1>
        <p className="text-muted-foreground">
          Detect your current coordinates from the browser.
        </p>
      </div>
      <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
        Location detection coming soon
      </div>
      <div className="rounded-lg border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Learn more: </span>
          <Link href="/what-is-my-location" className="underline underline-offset-2 hover:text-foreground">What Is My Location? — instant IP + GPS lookup guide</Link>
        </p>
      </div>
    </div>
  );
}
