import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbSchema } from "@/components/breadcrumb-schema";

export function generateMetadata(): Metadata {
  return {
    title: "Bulk Address to Coordinates API",
    description:
      "Convert hundreds of street addresses to lat/lng in a single API call. Batch geocoding endpoint returns DD, DMS, UTM, or MGRS. Free to start, no credit card.",
    alternates: { canonical: "/bulk-address-to-coordinates-api" },
  };
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the maximum batch size for the bulk API?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The batch geocoding endpoint accepts up to 500 addresses per request. For larger datasets, split your payload into multiple calls or use the CSV upload tool which has no row limit.",
      },
    },
    {
      "@type": "Question",
      name: "What coordinate formats can the API return?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The API returns Decimal Degrees (lat/lng) by default, and the batch converter tool can transform results into DMS, UTM, MGRS, or formatted addresses. You can request multiple output formats in a single conversion pass.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need an API key for the batch endpoint?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Anonymous requests are accepted with rate limits enforced via IP-based quotas. For higher throughput and dedicated limits, generate an API key from your dashboard and include it in the Authorization header.",
      },
    },
    {
      "@type": "Question",
      name: "How does the cascading geocoder improve hit rates?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The system queries Nominatim (OpenStreetMap) first. If Nominatim returns no result or low-confidence match, the request automatically falls back to OpenCage. This two-provider cascade typically achieves a 95%+ hit rate for well-formed addresses without any manual intervention.",
      },
    },
  ],
};

const faqItems = [
  {
    q: "What is the maximum batch size for the bulk API?",
    a: "The batch geocoding endpoint accepts up to 500 addresses per request. For larger datasets, split your payload into multiple calls or use the CSV upload tool which has no row limit.",
  },
  {
    q: "What coordinate formats can the API return?",
    a: "The API returns Decimal Degrees (lat/lng) by default, and the batch converter tool can transform results into DMS, UTM, MGRS, or formatted addresses. You can request multiple output formats in a single conversion pass.",
  },
  {
    q: "Do I need an API key for the batch endpoint?",
    a: "Anonymous requests are accepted with rate limits enforced via IP-based quotas. For higher throughput and dedicated limits, generate an API key from your dashboard and include it in the Authorization header.",
  },
  {
    q: "How does the cascading geocoder improve hit rates?",
    a: "The system queries Nominatim (OpenStreetMap) first. If Nominatim returns no result or low-confidence match, the request automatically falls back to OpenCage. This two-provider cascade typically achieves a 95%+ hit rate for well-formed addresses without any manual intervention.",
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
          { name: "Bulk Address to Coordinates API", href: "/bulk-address-to-coordinates-api" },
        ]}
      />
      <div className="mx-auto max-w-3xl space-y-16 px-5 py-12">
        <section className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Bulk Address to Coordinates API
          </h1>
          <p className="text-lg text-muted-foreground">
            Send an array of street addresses to a single REST endpoint and
            receive back lat/lng coordinates for every entry. The bulk
            geocoding API is designed for developers who need to enrich
            databases, power map visualizations, or feed logistics systems
            without geocoding each address one at a time.
          </p>
          <p className="text-muted-foreground">
            You POST a JSON array of addresses to /api/geocode/batch and get
            back latitude, longitude, a confidence score, and the resolved
            address for every entry. Each batch accepts up to 500 addresses and
            returns results in the same order you sent them. The API typically
            responds in under 500ms per batch of 100 addresses, and the
            cascading provider chain achieves a 95%+ geocoding hit rate.
          </p>
          <p className="text-muted-foreground">
            Each request runs through a cascade of geocoding providers —
            Nominatim followed by OpenCage — to maximize match rates. Results
            are cached in Redis for 30 days so repeated lookups cost nothing.
            Responses include match confidence scores, formatted addresses, and
            the provider that resolved each input.
          </p>
          <p className="text-muted-foreground">
            Authentication is handled via Bearer tokens. Generate an API key
            from your dashboard and pass it in the Authorization header.
            Anonymous usage is also supported with IP-based rate limiting.
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
            What does a bulk geocoding API request look like?
          </h2>
          <p className="text-sm text-muted-foreground">
            Here is what a real batch geocoding request looks like against the REST endpoint.
          </p>
          <div className="rounded-lg border border-border bg-card p-5">
            <pre className="text-sm overflow-x-auto">
{`POST /api/geocode/batch
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "addresses": [
    "1600 Amphitheatre Parkway, Mountain View, CA",
    "1 Hacker Way, Menlo Park, CA",
    "350 5th Ave, New York, NY 10118"
  ]
}`}
            </pre>
          </div>
          <p className="text-sm text-muted-foreground">
            The API returns lat/lng, confidence scores, and the provider for each input:
          </p>
          <div className="rounded-lg border border-border bg-card p-5">
            <pre className="text-sm overflow-x-auto">
{`{
  "results": [
    {
      "input_index": 0,
      "lat": 37.4224, "lng": -122.0842,
      "formatted_address": "1600 Amphitheatre Parkway, Mountain View, CA 94043",
      "confidence": 0.95, "provider": "nominatim"
    },
    {
      "input_index": 1,
      "lat": 37.4846, "lng": -122.1483,
      "formatted_address": "1 Hacker Way, Menlo Park, CA 94025",  
      "confidence": 0.93, "provider": "nominatim"
    },
    {
      "input_index": 2,
      "lat": 40.7484, "lng": -73.9856,
      "formatted_address": "350 5th Ave, New York, NY 10118",
      "confidence": 0.97, "provider": "opencage"
    }
  ]
}`}
            </pre>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            How does GeoBatch pricing compare to Google Maps, Mapbox, HERE, and OpenCage?
          </h2>
          <p className="text-sm text-muted-foreground">
            GeoBatch offers the most generous free tier and the lowest per-request cost among major geocoding providers.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  <th className="border border-border px-4 py-2 text-left font-medium bg-muted">Provider</th>
                  <th className="border border-border px-4 py-2 text-left font-medium bg-muted">Free Tier</th>
                  <th className="border border-border px-4 py-2 text-left font-medium bg-muted">Per 1,000 req</th>
                  <th className="border border-border px-4 py-2 text-left font-medium bg-muted">Batch Limit</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-border px-4 py-2">GeoBatch</td>
                  <td className="border border-border px-4 py-2">500–2,000/day</td>
                  <td className="border border-border px-4 py-2">Free</td>
                  <td className="border border-border px-4 py-2">500</td>
                </tr>
                <tr>
                  <td className="border border-border px-4 py-2">Google Maps</td>
                  <td className="border border-border px-4 py-2">$200/mo credit (~40K req)</td>
                  <td className="border border-border px-4 py-2">$5.00</td>
                  <td className="border border-border px-4 py-2">Dynamic</td>
                </tr>
                <tr>
                  <td className="border border-border px-4 py-2">Mapbox</td>
                  <td className="border border-border px-4 py-2">50,000/mo</td>
                  <td className="border border-border px-4 py-2">$0.75</td>
                  <td className="border border-border px-4 py-2">100</td>
                </tr>
                <tr>
                  <td className="border border-border px-4 py-2">HERE</td>
                  <td className="border border-border px-4 py-2">250K transactions/mo</td>
                  <td className="border border-border px-4 py-2">$1.10</td>
                  <td className="border border-border px-4 py-2">Dynamic</td>
                </tr>
                <tr>
                  <td className="border border-border px-4 py-2">OpenCage</td>
                  <td className="border border-border px-4 py-2">2,500/day</td>
                  <td className="border border-border px-4 py-2">~€0.67</td>
                  <td className="border border-border px-4 py-2">500</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Sources: <a href="https://mapsplatform.google.com/pricing/" className="underline underline-offset-2 hover:text-foreground" target="_blank" rel="noopener noreferrer">Google Maps Platform</a>,{" "}
            <a href="https://www.mapbox.com/pricing/" className="underline underline-offset-2 hover:text-foreground" target="_blank" rel="noopener noreferrer">Mapbox</a>,{" "}
            <a href="https://www.here.com/pricing" className="underline underline-offset-2 hover:text-foreground" target="_blank" rel="noopener noreferrer">HERE</a>,{" "}
            <a href="https://opencagedata.com/pricing" className="underline underline-offset-2 hover:text-foreground" target="_blank" rel="noopener noreferrer">OpenCage</a>. Prices and free tiers may change; verify on provider websites.
          </p>
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
            Start geocoding in bulk
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            No credit card required. Upload a CSV or call the API directly.
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
            Need a guided upload instead? Use the{" "}
            <Link
              href="/geocoding-api-for-csv"
              className="underline underline-offset-2 hover:text-foreground"
            >
              CSV geocoding tool
            </Link>
            . For real estate listings, see{" "}
            <Link
              href="/real-estate-bulk-geocoding"
              className="underline underline-offset-2 hover:text-foreground"
            >
              bulk geocoding for MLS data
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
