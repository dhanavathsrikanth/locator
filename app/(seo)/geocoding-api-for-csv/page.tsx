import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbSchema } from "@/components/breadcrumb-schema";

export function generateMetadata(): Metadata {
  return {
    title: "Geocoding API for CSV Upload",
    description:
      "Upload a CSV of addresses and geocode them in bulk. Free API for converting street addresses to lat/lng coordinates with auto-detect of address columns.",
    alternates: { canonical: "/geocoding-api-for-csv" },
  };
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What CSV formats are supported for geocoding?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "GeoBatch accepts standard CSV files as well as XLSX spreadsheets. The system automatically scans your columns for address-like headers (Address, Street, Location, Full_Address) and pre-maps them. You can override the mapping manually before processing.",
      },
    },
    {
      "@type": "Question",
      name: "How many addresses can I geocode at once through CSV upload?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You can upload files of any size. The batch tool processes records in chunks of 200 with a progress bar, so large files remain manageable. For API access with higher volume needs, use the REST API endpoint which supports up to 500 addresses per batch call.",
      },
    },
    {
      "@type": "Question",
      name: "What coordinate formats can I export after geocoding?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "After geocoding you can download results in Decimal Degrees (DD), Degrees Minutes Seconds (DMS), UTM, MGRS, or as formatted addresses. You can also combine multiple formats in a single export.",
      },
    },
    {
      "@type": "Question",
      name: "How accurate is the geocoding for Indian addresses?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "GeoBatch uses Nominatim (OpenStreetMap) as the primary geocoding provider with automatic fallback to OpenCage. For Indian addresses, coverage is strong in urban and suburban areas. Rural addresses return results at the locality or district level in most cases.",
      },
    },
  ],
};

const faqItems = [
  {
    q: "What CSV formats are supported for geocoding?",
    a: "GeoBatch accepts standard CSV files as well as XLSX spreadsheets. The system automatically scans your columns for address-like headers (Address, Street, Location, Full_Address) and pre-maps them. You can override the mapping manually before processing.",
  },
  {
    q: "How many addresses can I geocode at once through CSV upload?",
    a: "You can upload files of any size. The batch tool processes records in chunks of 200 with a progress bar, so large files remain manageable. For API access with higher volume needs, use the REST API endpoint which supports up to 500 addresses per batch call.",
  },
  {
    q: "What coordinate formats can I export after geocoding?",
    a: "After geocoding you can download results in Decimal Degrees (DD), Degrees Minutes Seconds (DMS), UTM, MGRS, or as formatted addresses. You can also combine multiple formats in a single export.",
  },
  {
    q: "How accurate is the geocoding for Indian addresses?",
    a: "GeoBatch uses Nominatim (OpenStreetMap) as the primary geocoding provider with automatic fallback to OpenCage. For Indian addresses, coverage is strong in urban and suburban areas. Rural addresses return results at the locality or district level in most cases.",
  },
];

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", href: "/" },
          { name: "Resources", href: "/" },
          { name: "Geocoding API for CSV", href: "/geocoding-api-for-csv" },
        ]}
      />
      <div className="mx-auto max-w-3xl space-y-16 px-5 py-12">
        <section className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Geocoding API for CSV Upload
          </h1>
          <p className="text-lg text-muted-foreground">
            Turn a spreadsheet of street addresses into precise lat/lng
            coordinates without writing a single line of code. Upload a CSV or
            XLSX file, let the tool auto-detect your address columns, and
            download the geocoded results in your choice of coordinate format.
          </p>
          <p className="text-muted-foreground">
            You upload a CSV, the tool auto-detects which columns contain
            address data, and within seconds every row has latitude and
            longitude coordinates appended. Choose from output formats including
            Decimal Degrees, DMS, UTM, or MGRS. The cascading provider chain
            achieves a 95%+ hit rate, with typical results returning in under 2
            seconds per 100-row batch.
          </p>
          <div className="pt-2">
            <Link
              href="/batch"
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
            >
              Try it free
            </Link>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            What happens when you upload a CSV to the geocoder?
          </h2>
          <p className="text-sm text-muted-foreground">
            Here is the same address data before and after running through the geocoding pipeline.
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="font-medium mb-2">Before: Raw CSV</h3>
              <pre className="text-xs overflow-x-auto">
{`Customer,Address,City,State
Acme Corp,123 Main St,Springfield,IL
Beta Inc,456 Oak Ave,Portland,OR`}
              </pre>
            </div>
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="font-medium mb-2">After: Geocoded CSV</h3>
              <pre className="text-xs overflow-x-auto">
{`Customer,Address,City,State,Latitude,Longitude
Acme Corp,123 Main St,Springfield,IL,39.7817,-89.6501
Beta Inc,456 Oak Ave,Portland,OR,45.5152,-122.6784`}
              </pre>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqItems.map((item) => (
              <details
                key={item.q}
                className="group rounded-lg border border-border"
              >
                <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/50">
                  {item.q}
                  <svg
                    className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </summary>
                <div className="border-t border-border px-4 py-3 text-sm text-muted-foreground">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-6 text-center">
          <h2 className="text-xl font-semibold">
            Ready to geocode your CSV?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            No signup required. Upload your file and get coordinates back in
            seconds.
          </p>
          <div className="mt-4">
            <Link
              href="/batch"
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
            >
              Try it free
            </Link>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Also check out the{" "}
            <Link
              href="/bulk-address-to-coordinates-api"
              className="underline underline-offset-2 hover:text-foreground"
            >
              Bulk Address to Coordinates API
            </Link>{" "}
            for programmatic access, or learn how to{" "}
            <Link
              href="/geocode-google-sheets"
              className="underline underline-offset-2 hover:text-foreground"
            >
              geocode from Google Sheets
            </Link>
            .
          </p>
        </section>

        <p className="mt-16 text-xs text-muted-foreground text-center">
          Last updated: July 2026
        </p>
      </div>
    </>
  );
}
