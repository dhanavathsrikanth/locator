import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Location — Locator",
};

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
    </div>
  );
}
