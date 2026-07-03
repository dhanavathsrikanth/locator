import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Docs — Locator",
  alternates: { canonical: "/api-docs" },
};

import Link from "next/link";

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
      <div className="rounded-lg border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Learn more: </span>
          <Link href="/bulk-address-to-coordinates-api" className="underline underline-offset-2 hover:text-foreground">Bulk address to coordinates API</Link>
          {" — "}
          <Link href="/geocode-google-sheets" className="underline underline-offset-2 hover:text-foreground">Geocode from Google Sheets</Link>
          {" — "}
          <Link href="/geocoding-api-for-csv" className="underline underline-offset-2 hover:text-foreground">CSV geocoding API</Link>
        </p>
      </div>
    </div>
  );
}
