import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { BreadcrumbSchema } from "@/components/breadcrumb-schema";
import Link from "next/link";
import { Suspense } from "react";

const homeSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "GeoBatch",
  description:
    "Free geospatial API and web tools for batch geocoding, coordinate conversion, and location detection.",
  applicationCategory: "UtilityApplication",
  operatingSystem: "All",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

const routes = [
  { href: "/convert", label: "Convert", desc: "Coordinate format conversion" },
  { href: "/batch", label: "Batch", desc: "CSV / GeoJSON batch processing" },
  { href: "/my-location", label: "My Location", desc: "Browser-based geolocation" },
  { href: "/nearest-pumps", label: "Nearest Pumps", desc: "Find nearby petrol stations in India" },
  { href: "/api-docs", label: "API Docs", desc: "REST API reference" },
  { href: "/dashboard", label: "Dashboard", desc: "Usage & account (protected)" },
] as const;

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeSchema) }}
      />
      <BreadcrumbSchema
        items={[{ name: "Home", href: "/" }]}
      />
      <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <nav className="w-full flex justify-center border-b border-border h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <Link href={"/"}>GeoBatch</Link>
            </div>
            <Suspense>
              <AuthButton />
            </Suspense>
          </div>
        </nav>

        <div className="flex-1 flex flex-col gap-16 max-w-5xl p-5">
          <div className="flex flex-col items-center gap-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight">
              Free Geocoding API & Bulk Coordinate Conversion Tools
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg">
              Batch geocode addresses, convert coordinates between DD, DMS, UTM, and MGRS,
              and detect your current location — all with a free API and web interface.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {routes.map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className="rounded-lg border border-border bg-card p-5 hover:border-primary/50 transition-colors"
              >
                <h2 className="font-semibold mb-1">{r.label}</h2>
                <p className="text-sm text-muted-foreground font-mono">
                  {r.desc}
                </p>
              </Link>
            ))}
          </div>
        </div>

        <div className="w-full max-w-5xl px-5">
          <h2 className="text-xl font-semibold mb-4">Resources</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { href: "/geocoding-api-for-csv", label: "Geocoding API for CSV" },
              { href: "/bulk-address-to-coordinates-api", label: "Bulk Address to Coordinates API" },
              { href: "/real-estate-bulk-geocoding", label: "MLS Bulk Geocoding" },
              { href: "/delivery-route-geocoding", label: "Delivery Route Geocoding" },
              { href: "/drone-survey-coordinate-converter", label: "Drone Survey Converter" },
              { href: "/what-is-my-location", label: "What Is My Location?" },
              { href: "/geocode-google-sheets", label: "Geocode Google Sheets" },
            ].map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className="rounded-lg border border-border bg-card px-4 py-3 text-sm hover:border-primary/50 transition-colors"
              >
                {r.label}
              </Link>
            ))}
          </div>
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <p className="text-muted-foreground">GeoBatch</p>
          <ThemeSwitcher />
        </footer>
      </div>
    </main>
    </>
  );
}
