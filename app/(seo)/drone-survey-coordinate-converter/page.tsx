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
        "text": "Most drone flight logs export coordinates in Decimal Degrees (lat/lng) for GPS-based navigation. Survey-grade drones and photogrammetry software (Pix4D, DJI Terra, Agisoft) often use UTM or MGRS for local grid accuracy. GeoBatch supports all three and can convert between them in batch.",
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
    a: "Most drone flight logs export coordinates in Decimal Degrees (lat/lng) for GPS-based navigation. Survey-grade drones and photogrammetry software (Pix4D, DJI Terra, Agisoft) often use UTM or MGRS for local grid accuracy. GeoBatch supports all three and can convert between them in batch.",
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
            Upload a CSV of drone waypoints from DJI, Autel, or Pix4D and
            convert every coordinate between Decimal Degrees, UTM, and MGRS in a
            single batch. The tool auto-detects which columns contain coordinates
            and which format they are in, so mixed-format files are handled
            without extra configuration.
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
            How do you convert drone survey coordinates between MGRS, UTM, and Decimal Degrees?
          </h2>
          <p className="text-sm text-muted-foreground">
            Here are some example coordinate conversions that the batch tool can perform in a single pass.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  <th className="border border-border px-4 py-2 text-left font-medium bg-muted">Original Format</th>
                  <th className="border border-border px-4 py-2 text-left font-medium bg-muted">Original Value</th>
                  <th className="border border-border px-4 py-2 text-left font-medium bg-muted">Converted To</th>
                  <th className="border border-border px-4 py-2 text-left font-medium bg-muted">Result</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-border px-4 py-2">Decimal Degrees</td>
                  <td className="border border-border px-4 py-2">28.7041, 77.1025</td>
                  <td className="border border-border px-4 py-2">MGRS</td>
                  <td className="border border-border px-4 py-2">43Q 5 19160 317468</td>
                </tr>
                <tr>
                  <td className="border border-border px-4 py-2">UTM</td>
                  <td className="border border-border px-4 py-2">43Q 420000 3175000</td>
                  <td className="border border-border px-4 py-2">Decimal Degrees</td>
                  <td className="border border-border px-4 py-2">28.7041, 77.1025</td>
                </tr>
                <tr>
                  <td className="border border-border px-4 py-2">DMS</td>
                  <td className="border border-border px-4 py-2">28°42'15"N, 77°06'09"E</td>
                  <td className="border border-border px-4 py-2">Decimal Degrees</td>
                  <td className="border border-border px-4 py-2">28.7042, 77.1025</td>
                </tr>
              </tbody>
            </table>
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

        <p className="mt-16 text-xs text-muted-foreground text-center">
          Last updated: July 2026
        </p>
      </div>
    </>
  );
}
