import type { Metadata } from "next";
import Link from "next/link";

export function generateMetadata(): Metadata {
  return {
    title: "Bulk Address to Coordinates API — Locator",
    description:
      "Convert hundreds of street addresses to lat/lng in a single API call. Batch geocoding endpoint returns DD, DMS, UTM, or MGRS. Free to start, no credit card.",
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
            How It Works
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                1
              </span>
              <h3 className="mt-3 font-medium">Prepare Your Addresses</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Format your addresses as a JSON array of strings or as a CSV
                file with address columns. The system accepts full-address
                strings as well as structured fields like street, city, and
                postal code.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                2
              </span>
              <h3 className="mt-3 font-medium">Send a Batch Request</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                POST your payload to the /api/geocode/batch endpoint. Include
                your API key in the Authorization header. The endpoint processes
                up to 500 entries per call and returns results in the same
                order.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                3
              </span>
              <h3 className="mt-3 font-medium">Use the Coordinates</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                The response includes lat, lng, formatted_address, and
                confidence for each input. Pass the coordinates into your map
                visualization, routing engine, or database enrichment pipeline.
              </p>
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
      </div>
    </>
  );
}
