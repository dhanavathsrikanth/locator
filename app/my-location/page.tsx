import type { Metadata } from "next";
import MyLocationClient from "./my-location-client";
import { BreadcrumbSchema } from "@/components/breadcrumb-schema";

export const metadata: Metadata = {
  title: "My Location",
  description:
    "Detect your current location instantly using browser GPS or IP geolocation. Get precise lat/lng coordinates, a reverse-geocoded address, and a shareable interactive map link. Free, no signup.",
  alternates: { canonical: "/my-location" },
};

const locationSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "GeoBatch My Location Finder",
  description:
    "Detect your current location using browser GPS and IP geolocation. Get precise lat/lng coordinates and an interactive map.",
  applicationCategory: "UtilityApplication",
  operatingSystem: "All",
};

export default function MyLocationPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(locationSchema) }}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", href: "/" },
          { name: "My Location", href: "/my-location" },
        ]}
      />
      <MyLocationClient />
    </>
  );
}
