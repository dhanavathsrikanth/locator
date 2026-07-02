import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Batch Convert — Locator",
};

export default function BatchPage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-8 max-w-5xl mx-auto p-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Batch Convert</h1>
        <p className="text-muted-foreground">
          Upload CSV/GeoJSON files for batch coordinate conversion.
        </p>
      </div>
      <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
        Batch processing coming soon
      </div>
    </div>
  );
}
