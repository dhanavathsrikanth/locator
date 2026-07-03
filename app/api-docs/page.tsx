import type { Metadata } from "next";
import { BreadcrumbSchema } from "@/components/breadcrumb-schema";

export const metadata: Metadata = {
  title: "API Docs",
  description:
    "Complete REST API reference for GeoBatch geospatial services. Geocode addresses, convert coordinates between DD/DMS/UTM/MGRS, and batch-process CSV files. Free tier available, no credit card required.",
  alternates: { canonical: "/api-docs" },
};

import Link from "next/link";

const apiSchema = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  name: "GeoBatch API Documentation",
  description:
    "REST API reference for GeoBatch geospatial services including batch geocoding and coordinate conversion.",
  applicationCategory: "DeveloperAPI",
};

export default function ApiDocsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(apiSchema) }}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", href: "/" },
          { name: "API Docs", href: "/api-docs" },
        ]}
      />
      <div className="flex-1 w-full flex flex-col gap-8 max-w-5xl mx-auto p-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">API Documentation</h1>
        <p className="text-muted-foreground">
          REST API reference for the GeoBatch geospatial service.
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
    </>
  );
}
