import type { Metadata } from "next";
import { BreadcrumbSchema } from "@/components/breadcrumb-schema";
import { Code, Globe, MapPin, Fuel, Repeat, Key, Terminal } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "API Docs",
  description:
    "Complete REST API reference for GeoBatch geospatial services. Geocode addresses, convert coordinates between DD/DMS/UTM/MGRS, and batch-process CSV files. Free tier available, no credit card required.",
  alternates: { canonical: "/api-docs" },
};

const apiSchema = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  name: "GeoBatch API Documentation",
  description:
    "REST API reference for GeoBatch geospatial services including batch geocoding and coordinate conversion.",
  applicationCategory: "DeveloperAPI",
};

const endpoints = [
  {
    method: "POST",
    path: "/api/batch/geocode",
    icon: Globe,
    title: "Batch Geocode",
    desc: "Convert street addresses to lat/lng coordinates.",
    body: `{
  "addresses": [
    "1600 Amphitheatre Parkway, Mountain View, CA",
    "1 Hacker Way, Menlo Park, CA"
  ]
}`,
    response: `{
  "results": [
    { "lat": 37.422, "lon": -122.084, "address": "..." },
    { "lat": 37.485, "lon": -122.149, "address": "..." }
  ],
  "quota_remaining": 950
}`,
  },
  {
    method: "GET",
    path: "/api/my-location",
    icon: MapPin,
    title: "IP Geolocation",
    desc: "Get approximate location from the visitor&apos;s IP address.",
    response: `{
  "ip": "203.0.113.1",
  "city": "Mumbai",
  "country": "India",
  "latitude": 19.076,
  "longitude": 72.877,
  "isp": "Tata Communications",
  "asn": "AS4755",
  "is_vpn": false,
  "is_proxy": false
}`,
  },
  {
    method: "POST",
    path: "/api/nearby-pumps",
    icon: Fuel,
    title: "Nearby Petrol Pumps",
    desc: "Find fuel stations near a GPS coordinate using OpenStreetMap data.",
    body: `{
  "lat": 19.076,
  "lon": 72.877,
  "radius": 5000
}`,
    response: `{
  "pumps": [
    {
      "id": 12345,
      "name": "Indian Oil Petrol Pump",
      "brand": "Indian Oil",
      "lat": 19.08,
      "lon": 72.88,
      "distance": 0.45
    }
  ],
  "userLocation": { "lat": 19.076, "lon": 72.877 }
}`,
  },
];

export default function ApiDocsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(apiSchema) }}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", href: "/" },
          { name: "API Docs", href: "/api-docs" },
        ]}
      />
      <div className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6 pt-16 lg:pt-6 space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">API Documentation</h1>
          <p className="text-muted-foreground">
            REST API reference for the GeoBatch geospatial service. All endpoints are free to use within the daily quota.
          </p>
        </div>

        <div className="rounded-xl border bg-card p-4 sm:p-5 flex items-start gap-4">
          <Key className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              <span className="font-medium text-foreground">Authentication:</span>{" "}
              API endpoints use IP-based rate limiting (1,000 req/day). Sign up for a{" "}
              <Link href="/auth/sign-up" className="underline underline-offset-2 hover:text-foreground">free account</Link>{" "}
              to get an API key with higher limits.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {endpoints.map((ep) => {
            const Icon = ep.icon;
            return (
              <div key={ep.path} className="rounded-xl border bg-card overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-border space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                          {ep.method}
                        </span>
                        <span className="text-sm font-mono font-medium">{ep.path}</span>
                      </div>
                      <h3 className="font-semibold mt-1">{ep.title}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{ep.desc}</p>
                </div>

                <div className="divide-y divide-border">
                  {ep.body && (
                    <div className="p-4 sm:p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <Terminal className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Request Body</span>
                      </div>
                      <pre className="text-xs bg-muted/50 p-3 sm:p-4 rounded-lg overflow-x-auto font-mono leading-relaxed">
                        <code>{ep.body}</code>
                      </pre>
                    </div>
                  )}
                  <div className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Code className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Response</span>
                    </div>
                    <pre className="text-xs bg-muted/50 p-3 sm:p-4 rounded-lg overflow-x-auto font-mono leading-relaxed">
                      <code>{ep.response}</code>
                    </pre>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Repeat className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-sm">Rate Limits</h2>
          </div>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>Free tier: <span className="font-medium text-foreground">1,000 requests/day</span> per IP address.</p>
            <p>
              <Link href="/auth/sign-up" className="underline underline-offset-2 hover:text-foreground">Create an account</Link>{" "}
              for higher limits and dedicated API keys.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Learn more: </span>
            <Link href="/bulk-address-to-coordinates-api" className="underline underline-offset-2 hover:text-foreground">Bulk address to coordinates API</Link>
            {" — "}
            <Link href="/geocode-google-sheets" className="underline underline-offset-2 hover:text-foreground">Geocode from Google Sheets</Link>
            {" — "}
            <Link href="/geocoding-api-for-csv" className="underline underline-offset-2 hover:text-foreground">CSV geocoding API</Link>
          </p>
        </div>

        <p className="text-xs text-muted-foreground text-center pb-8">
          Last updated: July 2026
        </p>
      </div>
    </>
  );
}
