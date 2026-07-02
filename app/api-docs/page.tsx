import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Docs — Locator",
};

export default function ApiDocsPage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-8 max-w-5xl mx-auto p-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">API Documentation</h1>
        <p className="text-muted-foreground">
          REST API reference for the Locator geospatial service.
        </p>
      </div>
      <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
        API documentation coming soon
      </div>
    </div>
  );
}
