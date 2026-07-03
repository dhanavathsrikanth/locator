import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbSchema } from "@/components/breadcrumb-schema";

export function generateMetadata(): Metadata {
  return {
    title: "Convert MLS Listing Addresses to Coordinates in Bulk",
    description:
      "Geocode thousands of MLS property addresses to lat/lng for real estate mapping. Upload a CSV of listings, auto-map MLS fields, and download coordinates in DD, DMS, or UTM.",
    alternates: { canonical: "/real-estate-bulk-geocoding" },
  };
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      "name": "Which MLS fields does the tool recognise automatically?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The tool scans for common real-estate column headers including Address, Street, City, State, PostalCode, Zip, County, and ListingAddress. Any unrecognised columns can be mapped manually through the column-picker interface before processing.",
      },
    },
    {
      "@type": "Question",
      "name": "How accurate is geocoding for rural MLS listings?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Urban and suburban properties typically resolve to rooftop or parcel level. Rural listings with P.O. boxes or non-standard addresses may resolve to the nearest street or locality. The confidence score in each result helps you filter matches that need manual review.",
      },
    },
    {
      "@type": "Question",
      "name": "Can I export coordinates in a format compatible with GIS software?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. You can export in Decimal Degrees for direct import into QGIS, ArcGIS, or Google Earth. UTM and MGRS formats are also supported for survey-grade workflows. All exports preserve your original MLS column data alongside the new coordinate columns.",
      },
    },
    {
      "@type": "Question",
      "name": "Is my listing data stored or shared after geocoding?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. Address data is sent to the geocoding provider (Nominatim / OpenStreetMap) only for the purpose of resolving coordinates. GeoBatch does not store your uploaded files or listing data on its servers. Results are cached temporarily to speed up repeat lookups but are not logged or shared.",
      },
    },
  ],
};

const faqItems = [
  {
    q: "Which MLS fields does the tool recognise automatically?",
    a: "The tool scans for common real-estate column headers including Address, Street, City, State, PostalCode, Zip, County, and ListingAddress. Any unrecognised columns can be mapped manually through the column-picker interface before processing.",
  },
  {
    q: "How accurate is geocoding for rural MLS listings?",
    a: "Urban and suburban properties typically resolve to rooftop or parcel level. Rural listings with P.O. boxes or non-standard addresses may resolve to the nearest street or locality. The confidence score in each result helps you filter matches that need manual review.",
  },
  {
    q: "Can I export coordinates in a format compatible with GIS software?",
    a: "Yes. You can export in Decimal Degrees for direct import into QGIS, ArcGIS, or Google Earth. UTM and MGRS formats are also supported for survey-grade workflows. All exports preserve your original MLS column data alongside the new coordinate columns.",
  },
  {
    q: "Is my listing data stored or shared after geocoding?",
    a: "No. Address data is sent to the geocoding provider (Nominatim / OpenStreetMap) only for the purpose of resolving coordinates. GeoBatch does not store your uploaded files or listing data on its servers. Results are cached temporarily to speed up repeat lookups but are not logged or shared.",
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
          { name: "MLS Bulk Geocoding", href: "/real-estate-bulk-geocoding" },
        ]}
      />
      <div className="mx-auto max-w-3xl space-y-16 px-5 py-12">
        <section className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Convert MLS Listing Addresses to Coordinates in Bulk
          </h1>
          <p className="text-lg text-muted-foreground">
            Upload a CSV of MLS property listings and convert every street
            address into precise lat/lng coordinates in minutes. The tool
            recognizes common real-estate column headers — Address, Street, City,
            PostalCode, County — and maps them automatically.
          </p>
          <p className="text-muted-foreground">
            The batch CSV tool understands common real-estate column naming
            conventions — Address, Street, City, PostalCode, County — and auto-maps
            them so you don&apos;t have to configure anything. Simply export your
            listings from your MLS platform as a CSV, upload, and let the tool
            append lat/lng coordinates to every row.
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
            What does geocoded MLS listing data look like?
          </h2>
          <p className="text-sm text-muted-foreground">
            Here is what a typical MLS export looks like before and after geocoding.
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="font-medium mb-2">Before: MLS Export</h3>
              <pre className="text-xs overflow-x-auto">
{`MLS#,Address,City,Price,Beds,Baths
MLS001,123 Main St,Springfield,$450000,3,2
MLS002,456 Oak Ave,Portland,$675000,4,3`}
              </pre>
            </div>
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="font-medium mb-2">After: Geocoded Listings</h3>
              <pre className="text-xs overflow-x-auto">
{`MLS#,Address,City,Price,Beds,Baths,Latitude,Longitude
MLS001,123 Main St,Springfield,$450000,3,2,39.7817,-89.6501
MLS002,456 Oak Ave,Portland,$675000,4,3,45.5152,-122.6784`}
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
            Ready to map your listings?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Upload your MLS export and get coordinates for every property.
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
            Working with drone survey data? See the{" "}
            <Link
              href="/drone-survey-coordinate-converter"
              className="underline underline-offset-2 hover:text-foreground"
            >
              drone survey coordinate converter
            </Link>{" "}
            for MGRS and UTM batch processing. For general bulk geocoding,
            visit the{" "}
            <Link
              href="/bulk-address-to-coordinates-api"
              className="underline underline-offset-2 hover:text-foreground"
            >
              bulk address to coordinates API
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
