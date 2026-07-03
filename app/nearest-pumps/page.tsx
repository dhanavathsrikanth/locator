import type { Metadata } from "next";
import NearestPumpsClient from "./nearest-pumps-client";
import { BreadcrumbSchema } from "@/components/breadcrumb-schema";

export const metadata: Metadata = {
  title: "Nearest Petrol Pumps",
  description:
    "Find nearby petrol pumps (gas stations) across India using GPS coordinates. Locate fuel stations on an interactive map with distances, brand names, and directions. Free, no signup required.",
  alternates: { canonical: "/nearest-pumps" },
};

function SeoLinks() {
  return (
    <div className="mx-auto max-w-5xl px-5 pb-12">
      <div className="rounded-lg border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Learn more: </span>
          <a href="/delivery-route-geocoding" className="underline underline-offset-2 hover:text-foreground">Bulk geocode delivery routes from CSV</a>
          {" — "}
          <a href="/bulk-address-to-coordinates-api" className="underline underline-offset-2 hover:text-foreground">Bulk address to coordinates API</a>
        </p>
      </div>
    </div>
  );
}

const nearestPumpsSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "GeoBatch Nearest Petrol Pumps Finder",
  description:
    "Find nearby petrol stations across India using GPS coordinates. Locate fuel pumps on an interactive map with distances and brand information.",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "All",
};

export default function NearestPumpsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(nearestPumpsSchema) }}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", href: "/" },
          { name: "Nearest Petrol Pumps", href: "/nearest-pumps" },
        ]}
      />
      <NearestPumpsClient />
      <SeoLinks />
    </>
  );
}
