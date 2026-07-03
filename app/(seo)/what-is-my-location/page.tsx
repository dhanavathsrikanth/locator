import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbSchema } from "@/components/breadcrumb-schema";

export function generateMetadata(): Metadata {
  return {
    title: "What Is My Location? Instant IP + GPS Lookup",
    description:
      "Find your current location instantly using IP geolocation and browser GPS. Get lat/lng coordinates, address, and a shareable map link. No signup required.",
    alternates: { canonical: "/what-is-my-location" },
  };
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      "name": "How does the location lookup work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The tool uses two methods simultaneously. First, browser GPS (Geolocation API) requests a precise position from your device's GPS hardware. Second, IP geolocation estimates your city-level location from your internet connection. GPS results are displayed when available; IP location serves as a fallback for desktop or denied-permission scenarios.",
      },
    },
    {
      "@type": "Question",
      "name": "How accurate is IP geolocation compared to GPS?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "GPS typically provides accuracy within 5–20 metres outdoors. IP geolocation is less precise — usually accurate to the city or district level (1–50 km radius). The tool shows both results so you can compare. For exact coordinates, allow GPS access from your browser.",
      },
    },
    {
      "@type": "Question",
      "name": "Is my location data stored or shared?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. Location data is processed entirely in your browser and during the server-side IP lookup. No coordinates or IP addresses are logged or stored by GeoBatch. The IP geocoding result is cached briefly for performance but is not persisted or shared with third parties.",
      },
    },
    {
      "@type": "Question",
      "name": "Why does my browser ask for permission to access location?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Modern browsers require explicit user consent before granting access to GPS data. This is a privacy protection measure. If you decline, the tool falls back to IP-based location which does not require permission. You can change your decision in your browser's site permissions settings at any time.",
      },
    },
  ],
};

const faqItems = [
  {
    q: "How does the location lookup work?",
    a: "The tool uses two methods simultaneously. First, browser GPS (Geolocation API) requests a precise position from your device's GPS hardware. Second, IP geolocation estimates your city-level location from your internet connection. GPS results are displayed when available; IP location serves as a fallback for desktop or denied-permission scenarios.",
  },
  {
    q: "How accurate is IP geolocation compared to GPS?",
    a: "GPS typically provides accuracy within 5–20 metres outdoors. IP geolocation is less precise — usually accurate to the city or district level (1–50 km radius). The tool shows both results so you can compare. For exact coordinates, allow GPS access from your browser.",
  },
  {
    q: "Is my location data stored or shared?",
    a: "No. Location data is processed entirely in your browser and during the server-side IP lookup. No coordinates or IP addresses are logged or stored by GeoBatch. The IP geocoding result is cached briefly for performance but is not persisted or shared with third parties.",
  },
  {
    q: "Why does my browser ask for permission to access location?",
    a: "Modern browsers require explicit user consent before granting access to GPS data. This is a privacy protection measure. If you decline, the tool falls back to IP-based location which does not require permission. You can change your decision in your browser's site permissions settings at any time.",
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
          { name: "What Is My Location?", href: "/what-is-my-location" },
        ]}
      />
      <div className="mx-auto max-w-3xl space-y-16 px-5 py-12">
        <section className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            What Is My Location? Instant IP + GPS Lookup
          </h1>
          <p className="text-lg text-muted-foreground">
            Need to know your current coordinates, address, or place on a map?
            Open GeoBatch&apos;s location tool and within seconds you&apos;ll see your
            latitude and longitude, a reverse-geocoded address, and an
            interactive map centred on your position. Two data sources — GPS and
            IP — work together to give you the best possible result.
          </p>
          <p className="text-muted-foreground">
            On a phone or laptop with GPS, the browser&apos;s location service
            delivers coordinates accurate to a few metres. On a desktop without
            GPS hardware, IP geolocation provides your approximate city or
            region. Both methods are combined into a single view so you always
            get an answer, even without granting location permissions.
          </p>
          <div className="pt-2">
            <Link
              href="/my-location"
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
            >
              Find my location
            </Link>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            What information will I see when I check my location?
          </h2>
          <p className="text-sm text-muted-foreground">
            When you open the location tool, here is the kind of result you will see — either from GPS or IP geolocation.
          </p>
          <div className="rounded-lg border border-border bg-card p-5 font-mono text-sm space-y-1">
            <p>Latitude:  28.6139° N</p>
            <p>Longitude: 77.2090° E</p>
            <p>Accuracy:  ±15 metres (GPS)</p>
            <p>Address:   New Delhi, Delhi, India</p>
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
            See where you are right now
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Open the tool — no signup, no credit card.
          </p>
          <div className="mt-4">
            <Link
              href="/my-location"
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
            >
              Find my location
            </Link>
          </div>
        </section>

        <p className="mt-16 text-xs text-muted-foreground text-center">
          Last updated: July 2026
        </p>
      </div>
    </>
  );
}
