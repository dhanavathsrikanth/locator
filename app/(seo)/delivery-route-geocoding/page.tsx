import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbSchema } from "@/components/breadcrumb-schema";

export function generateMetadata(): Metadata {
  return {
    title: "Bulk Geocode Delivery Routes from CSV",
    description:
      "Upload a CSV of delivery stop addresses and geocode them in bulk for route optimisation. Export coordinates for Google Maps, Mapbox, or any navigation platform.",
    alternates: { canonical: "/delivery-route-geocoding" },
  };
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      "name": "How many delivery stops can I geocode in one batch?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The CSV upload tool has no hard row limit. Records are processed in chunks of 200 with a real-time progress bar. For very large fleets — thousands of stops — you can split the file or use the REST API which handles up to 500 addresses per request.",
      },
    },
    {
      "@type": "Question",
      "name": "Can I export coordinates formatted for Google Maps or Mapbox?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Decimal Degrees (lat, lng) is the default output and is directly compatible with the Google Maps API, Mapbox GL JS, Leaflet, and most routing engines. DMS and UTM formats are also available for specialised logistics software.",
      },
    },
    {
      "@type": "Question",
      "name": "Does the tool work with international addresses?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. The cascading geocoder — Nominatim backed by OpenCage — covers addresses worldwide. Coverage is strongest in North America, Europe, and urban India. Remote or rural international addresses may resolve at the locality level.",
      },
    },
    {
      "@type": "Question",
      "name": "Can I find nearby petrol pumps along my delivery route?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Once your delivery stops are geocoded, use the nearest-petrol-pumps tool to find fuel stations near any stop coordinate. The tool queries OpenStreetMap for amenity=fuel and returns distances, brand names, and map locations.",
      },
    },
  ],
};

const faqItems = [
  {
    q: "How many delivery stops can I geocode in one batch?",
    a: "The CSV upload tool has no hard row limit. Records are processed in chunks of 200 with a real-time progress bar. For very large fleets — thousands of stops — you can split the file or use the REST API which handles up to 500 addresses per request.",
  },
  {
    q: "Can I export coordinates formatted for Google Maps or Mapbox?",
    a: "Yes. Decimal Degrees (lat, lng) is the default output and is directly compatible with the Google Maps API, Mapbox GL JS, Leaflet, and most routing engines. DMS and UTM formats are also available for specialised logistics software.",
  },
  {
    q: "Does the tool work with international addresses?",
    a: "Yes. The cascading geocoder — Nominatim backed by OpenCage — covers addresses worldwide. Coverage is strongest in North America, Europe, and urban India. Remote or rural international addresses may resolve at the locality level.",
  },
  {
    q: "Can I find nearby petrol pumps along my delivery route?",
    a: "Yes. Once your delivery stops are geocoded, use the nearest-petrol-pumps tool to find fuel stations near any stop coordinate. The tool queries OpenStreetMap for amenity=fuel and returns distances, brand names, and map locations.",
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
          { name: "Delivery Route Geocoding", href: "/delivery-route-geocoding" },
        ]}
      />
      <div className="mx-auto max-w-3xl space-y-16 px-5 py-12">
        <section className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Bulk Geocode Delivery Routes from CSV
          </h1>
          <p className="text-lg text-muted-foreground">
            Upload a CSV of delivery stop addresses and get back lat/lng
            coordinates for every stop, ready for route optimisation in Google
            Maps, Mapbox, or any navigation platform. No coding required — just
            export from your dispatch system, upload, and download the geocoded
            results.
          </p>
          <p className="text-muted-foreground">
            Logistics teams typically export stops from a dispatch system as a
            CSV with columns for Address, City, and Postal Code. The batch tool
            detects these columns automatically, geocodes each address through a
            cascading provider pipeline, and produces a clean output file with
            coordinates appended. Upload a new delivery manifest each morning
            and have geocoded data in under a minute.
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
            What does a geocoded delivery route CSV look like?
          </h2>
          <p className="text-sm text-muted-foreground">
            Here is what a delivery route file looks like before and after geocoding with the batch tool.
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="font-medium mb-2">Before: Route CSV</h3>
              <pre className="text-xs overflow-x-auto">
{`StopID,Address,City,Zip,TimeWindow
S001,123 Main St,Springfield,IL,09:00-10:00
S002,456 Oak Ave,Portland,OR,10:30-11:30`}
              </pre>
            </div>
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="font-medium mb-2">After: Geocoded Route</h3>
              <pre className="text-xs overflow-x-auto">
{`StopID,Address,City,Zip,TimeWindow,Latitude,Longitude
S001,123 Main St,Springfield,IL,09:00-10:00,39.7817,-89.6501
S002,456 Oak Ave,Portland,OR,10:30-11:30,45.5152,-122.6784`}
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
            Geocode your delivery routes
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Upload today&apos;s manifest and get coordinates for every stop.
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
            Need fuel stops along the way? Use the{" "}
            <Link
              href="/nearest-pumps"
              className="underline underline-offset-2 hover:text-foreground"
            >
              nearest petrol pumps finder
            </Link>
            . For real estate route planning, see{" "}
            <Link
              href="/real-estate-bulk-geocoding"
              className="underline underline-offset-2 hover:text-foreground"
            >
              MLS bulk geocoding
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
