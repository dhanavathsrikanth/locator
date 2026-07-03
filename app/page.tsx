import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { BreadcrumbSchema } from "@/components/breadcrumb-schema";
import Link from "next/link";
import { Suspense } from "react";
import { Repeat, Package, MapPin, Fuel, BookOpen, LayoutDashboard, ArrowRight } from "lucide-react";

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

const routes: { href: string; label: string; desc: string; icon: typeof Repeat }[] = [
  { href: "/convert", label: "Convert", desc: "Coordinate format conversion between DD, DMS, UTM, MGRS, and more", icon: Repeat },
  { href: "/batch", label: "Batch", desc: "CSV / XLSX bulk coordinate conversion & address geocoding", icon: Package },
  { href: "/my-location", label: "My Location", desc: "Detect your location with IP geolocation & device GPS", icon: MapPin },
  { href: "/nearest-pumps", label: "Nearest Pumps", desc: "Find nearby petrol stations across India", icon: Fuel },
  { href: "/api-docs", label: "API Docs", desc: "REST API reference for geocoding & coordinate conversion", icon: BookOpen },
  { href: "/dashboard", label: "Dashboard", desc: "Usage analytics, API keys, and account settings", icon: LayoutDashboard },
];

const resources = [
  { href: "/geocoding-api-for-csv", label: "Geocoding API for CSV" },
  { href: "/bulk-address-to-coordinates-api", label: "Bulk Address to Coordinates API" },
  { href: "/real-estate-bulk-geocoding", label: "MLS Bulk Geocoding for Real Estate" },
  { href: "/delivery-route-geocoding", label: "Delivery Route Geocoding" },
  { href: "/drone-survey-coordinate-converter", label: "Drone Survey Coordinate Converter" },
  { href: "/what-is-my-location", label: "What Is My Location?" },
  { href: "/geocode-google-sheets", label: "Geocode Google Sheets" },
];

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeSchema) }}
      />
      <BreadcrumbSchema items={[{ name: "Home", href: "/" }]} />
      <div className="min-h-screen flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-sm">
          <div className="flex items-center justify-end h-14 px-6 gap-3 max-w-7xl mx-auto">
            <Suspense>
              <AuthButton />
            </Suspense>
            <ThemeSwitcher />
          </div>
        </header>

        <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
          {/* Hero */}
          <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-24">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4 bg-gradient-to-r from-primary via-teal-400 to-primary bg-clip-text text-transparent">
              Free Geocoding &amp; Coordinate Tools
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Batch geocode addresses, convert between DD, DMS, UTM, and MGRS,
              detect your current location, and find nearby petrol pumps — all
              with a free API and web interface.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
              <Link
                href="/convert"
                className="rounded-xl bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/api-docs"
                className="rounded-xl border border-border bg-card px-6 py-3 text-sm font-medium hover:bg-accent transition-colors"
              >
                API Reference
              </Link>
            </div>
          </div>

          {/* Tool cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-16">
            {routes.map((r) => {
              const Icon = r.icon;
              return (
                <Link
                  key={r.href}
                  href={r.href}
                  className="group rounded-xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-sm transition-all duration-200"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/15 transition-colors">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                    {r.label}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {r.desc}
                  </p>
                </Link>
              );
            })}
          </div>

          {/* Resources */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Resources &amp; Guides</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {resources.map((r) => (
                <Link
                  key={r.href}
                  href={r.href}
                  className="rounded-lg border border-border bg-card px-4 py-3 text-sm hover:border-primary/30 hover:bg-accent/50 transition-all duration-200"
                >
                  {r.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-border">
          <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between text-xs text-muted-foreground">
            <p>GeoBatch &mdash; Free Geospatial Tools</p>
          </div>
        </footer>
      </div>
    </>
  );
}
