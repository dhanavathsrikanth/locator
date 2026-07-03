import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbSchema } from "@/components/breadcrumb-schema";

export function generateMetadata(): Metadata {
  return {
    title: "Drone Survey Coordinate Converter (MGRS/UTM Batch)",
    description:
      "Convert drone survey coordinates between MGRS, UTM, and Decimal Degrees in batch. Upload flight logs, choose output format, and download clean coordinate data.",
    alternates: { canonical: "/drone-survey-coordinate-converter" },
  };
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      "name": "What coordinate formats do drone surveys typically use?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Most drone flight logs export coordinates in Decimal Degrees (lat/lng) for GPS-based navigation. Survey-grade drones and photogrammetry software (Pix4D, DJI Terra, Agisoft) often use UTM or MGRS for local grid accuracy. Locator supports all three and can convert between them in batch.",
      },
    },
    {
      "@type": "Question",
      "name": "Can I upload a DJI flight log CSV directly?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DJI exports CSV files with latitude and longitude columns that the batch tool detects automatically. You may need to verify the column mapping once uploaded. The drone survey template preset provides a quick-start mapping for standard flight-log columns.",
      },
    },
    {
      "@type": "Question",
      "name": "How does batch conversion handle MGRS grid zone boundaries?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Each MGRS coordinate string includes its grid zone designation (e.g. 44Q), so the converter can unambiguously interpret coordinates from multiple zones in a single file. The output lat/lng values are accurate regardless of zone mixing.",
      },
    },
    {
      "@type": "Question",
      "name": "Is coordinate precision preserved during conversion?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. The converter uses double-precision arithmetic internally. Decimal Degrees are rounded to 6 decimal places (approx. 11 cm precision), DMS to 2 decimal places, and UTM/MGRS to the meter level. No truncation or rounding errors are introduced beyond the standard display precision.",
      },
    },
  ],
};

const faqItems = [
  {
    q: "What coordinate formats do drone surveys typically use?",
    a: "Most drone flight logs export coordinates in Decimal Degrees (lat/lng) for GPS-based navigation. Survey-grade drones and photogrammetry software (Pix4D, DJI Terra, Agisoft) often use UTM or MGRS for local grid accuracy. Locator supports all three and can convert between them in batch.",
  },
  {
    q: "Can I upload a DJI flight log CSV directly?",
    a: "DJI exports CSV files with latitude and longitude columns that the batch tool detects automatically. You may need to verify the column mapping once uploaded. The drone survey template preset provides a quick-start mapping for standard flight-log columns.",
  },
  {
    q: "How does batch conversion handle MGRS grid zone boundaries?",
    a: "Each MGRS coordinate string includes its grid zone designation (e.g. 44Q), so the converter can unambiguously interpret coordinates from multiple zones in a single file. The output lat/lng values are accurate regardless of zone mixing.",
  },
  {
    q: "Is coordinate precision preserved during conversion?",
    a: "Yes. The converter uses double-precision arithmetic internally. Decimal Degrees are rounded to 6 decimal places (approx. 11 cm precision), DMS to 2 decimal places, and UTM/MGRS to the meter level. No truncation or rounding errors are introduced beyond the standard display precision.",
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
          { name: "Drone Survey Coordinate Converter", href: "/drone-survey-coordinate-converter" },
        ]}
      />
      <div className="mx-auto max-w-3xl space-y-16 px-5 py-12">
        <section className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Drone Flight Log & Survey Coordinate Converter (MGRS/UTM Batch)
          </h1>
          <p className="text-lg text-muted-foreground">
            Drone surveyors routinely work across multiple coordinate systems.
            Flight logs from DJI, Autel, and other platforms record GPS
            positions in Decimal Degrees. Photogrammetry software like Pix4D and
            Agisoft expects UTM. Government and military survey grids use MGRS.
            Locator converts between all of these formats in batch, handling
            thousands of waypoints at once.
          </p>
          <p className="text-muted-foreground">
            Instead of manually converting coordinates one by one — or writing
            scripts that may introduce rounding errors — upload your CSV or XLSX
            file, select the source and target formats, and download the
            converted dataset. The converter auto-detects coordinate formats
            within each column, so mixed-format files are handled without extra
            configuration.
          </p>
          <div className="flex gap-3 pt-2">
            <Link
              href="/batch"
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
            >
              Try it free
            </Link>
            <Link
              href="/convert"
              className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-6 text-sm font-medium shadow-sm hover:bg-accent transition-colors"
            >
              Single coordinate converter
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
              <h3 className="mt-3 font-medium">Upload Flight Log or Survey Data</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Export waypoints from your flight log (DJI CSV, Pix4D, etc.) or
                survey spreadsheet. Upload the file to the batch tool. Columns
                containing coordinates are highlighted and auto-mapped.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                2
              </span>
              <h3 className="mt-3 font-medium">Select Output Format</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose the target coordinate format — MGRS for survey grids, UTM
                for local precision, or Decimal Degrees for interoperability.
                The converter processes all rows in parallel chunks of 200.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                3
              </span>
              <h3 className="mt-3 font-medium">Download Converted Data</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Get your output as CSV or XLSX. Original columns are preserved
                and converted coordinates are appended. The new columns are
                labelled clearly so they can be imported directly into your
                survey or GIS software.
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
            Convert your survey coordinates
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Upload flight logs, choose MGRS or UTM, download clean data.
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
            Need to convert a single coordinate? Use the{" "}
            <Link
              href="/convert"
              className="underline underline-offset-2 hover:text-foreground"
            >
              interactive converter
            </Link>
            . For real-estate survey workflows, see{" "}
            <Link
              href="/real-estate-bulk-geocoding"
              className="underline underline-offset-2 hover:text-foreground"
            >
              MLS listing geocoding
            </Link>
            .
          </p>
        </section>
      </div>
    </>
  );
}
