import type { Metadata } from "next";
import Link from "next/link";

export function generateMetadata(): Metadata {
  return {
    title: "Geocode Addresses Directly in Google Sheets — Locator",
    description:
      "Geocode addresses from Google Sheets in bulk. Export your sheet as CSV, upload to the batch geocoding tool, and import lat/lng coordinates back. Free, no plugin required.",
  };
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      "name": "Do I need to install a Google Sheets add-on?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. Locator works directly with standard CSV exports from Google Sheets. There is no add-on to install. Export your sheet as CSV (File > Download > Comma-separated values), upload to the batch tool, and import the results back. For automated workflows, the API can be called from Google Apps Script using the UrlFetch service.",
      },
    },
    {
      "@type": "Question",
      "name": "How do I import the geocoded results back into Google Sheets?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "After geocoding, download the result CSV from Locator. In Google Sheets, go to File > Import > Upload and select the file. Choose either 'Replace current sheet' or 'Insert new sheet'. The lat/lng columns will appear alongside your original data, preserving all existing rows and cell formatting.",
      },
    },
    {
      "@type": "Question",
      "name": "Can I geocode addresses from Google Sheets using the REST API?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. You can write a Google Apps Script that reads addresses from your sheet, calls the POST /api/geocode/batch endpoint, and writes the results to adjacent columns. The API accepts up to 500 addresses per request. An API key from your dashboard is required for authenticated access.",
      },
    },
    {
      "@type": "Question",
      "name": "How does the column mapping work when uploading a Sheets export?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "When you upload a CSV exported from Google Sheets, the batch tool scans column headers for address-related terms (Address, Street, City, PostalCode, etc.) and pre-selects those columns for geocoding. If your sheet uses non-standard column names, you can manually map each column to the correct address component before processing.",
      },
    },
  ],
};

const faqItems = [
  {
    q: "Do I need to install a Google Sheets add-on?",
    a: "No. Locator works directly with standard CSV exports from Google Sheets. There is no add-on to install. Export your sheet as CSV (File > Download > Comma-separated values), upload to the batch tool, and import the results back. For automated workflows, the API can be called from Google Apps Script using the UrlFetch service.",
  },
  {
    q: "How do I import the geocoded results back into Google Sheets?",
    a: "After geocoding, download the result CSV from Locator. In Google Sheets, go to File > Import > Upload and select the file. Choose either 'Replace current sheet' or 'Insert new sheet'. The lat/lng columns will appear alongside your original data, preserving all existing rows and cell formatting.",
  },
  {
    q: "Can I geocode addresses from Google Sheets using the REST API?",
    a: "Yes. You can write a Google Apps Script that reads addresses from your sheet, calls the POST /api/geocode/batch endpoint, and writes the results to adjacent columns. The API accepts up to 500 addresses per request. An API key from your dashboard is required for authenticated access.",
  },
  {
    q: "How does the column mapping work when uploading a Sheets export?",
    a: "When you upload a CSV exported from Google Sheets, the batch tool scans column headers for address-related terms (Address, Street, City, PostalCode, etc.) and pre-selects those columns for geocoding. If your sheet uses non-standard column names, you can manually map each column to the correct address component before processing.",
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
            Geocode Addresses Directly in Google Sheets
          </h1>
          <p className="text-lg text-muted-foreground">
            If you manage address data in Google Sheets — customer lists,
            delivery zones, property records, or event venues — you already have
            a spreadsheet full of text that needs coordinates. Locator lets you
            geocode those addresses without installing a Sheets extension or
            writing a script. Export, upload, convert, and import the results
            back in under five minutes.
          </p>
          <p className="text-muted-foreground">
            The workflow is intentionally simple: Google Sheets exports to CSV
            natively, and Locator&apos;s batch tool accepts CSV directly. No format
            conversion, no API keys needed for a quick one-off job. For
            recurring geocoding — weekly address refreshes, daily lead
            imports — the REST API can be wired into Google Apps Script for full
            automation.
          </p>
          <div className="flex gap-3 pt-2">
            <Link
              href="/batch"
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
            >
              Try it free
            </Link>
            <Link
              href="/api-docs"
              className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-6 text-sm font-medium shadow-sm hover:bg-accent transition-colors"
            >
              View API docs
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
              <h3 className="mt-3 font-medium">Export from Google Sheets</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Open your sheet and go to File &gt; Download &gt; Comma-separated
                values (.csv). Google exports all visible columns, including
                address fields, customer names, and any other data you need
                preserved.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                2
              </span>
              <h3 className="mt-3 font-medium">Upload and Geocode</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Drag the CSV onto Locator&apos;s batch tool. Address columns are
                auto-detected. Toggle the Geocode option and click Convert. A
                progress bar tracks every row as it is resolved through the
                cascading geocoding pipeline.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                3
              </span>
              <h3 className="mt-3 font-medium">Import Back to Sheets</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Download the geocoded CSV. In Google Sheets, go to File &gt;
                Import &gt; Upload and select the file. Choose to replace the
                current sheet or add a new one. Your addresses now have lat/lng
                coordinates alongside them.
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
            Geocode your Google Sheets data
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Export, upload, convert, and import — no plugins needed.
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
            Need to process addresses programmatically? Use the{" "}
            <Link
              href="/geocoding-api-for-csv"
              className="underline underline-offset-2 hover:text-foreground"
            >
              geocoding API for CSV upload
            </Link>{" "}
            or the{" "}
            <Link
              href="/bulk-address-to-coordinates-api"
              className="underline underline-offset-2 hover:text-foreground"
            >
              bulk geocoding REST API
            </Link>
            .
          </p>
        </section>
      </div>
    </>
  );
}
