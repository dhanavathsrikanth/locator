import type { Metadata } from "next";
import ConvertClient from "./convert-client";
import { BreadcrumbSchema } from "@/components/breadcrumb-schema";

export const metadata: Metadata = {
  title: "Convert Coordinates",
  description:
    "Free online coordinate converter. Instantly convert between Decimal Degrees, DMS, DDM, UTM, MGRS, Geohash, and Plus Codes. Batch conversion also supported for CSV files. No login required.",
  alternates: { canonical: "/convert" },
};

function SeoLinks() {
  return (
    <div className="mx-auto max-w-5xl px-5 pb-12">
      <div className="rounded-lg border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Learn more: </span>
          <a href="/drone-survey-coordinate-converter" className="underline underline-offset-2 hover:text-foreground">Drone survey coordinate converter (MGRS/UTM batch)</a>
          {" — "}
          <a href="/bulk-address-to-coordinates-api" className="underline underline-offset-2 hover:text-foreground">Bulk address to coordinates API</a>
        </p>
      </div>
    </div>
  );
}

const convertSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "GeoBatch Coordinate Converter",
  description:
    "Free online coordinate converter supporting Decimal Degrees, DMS, DDM, UTM, MGRS, Geohash, and Plus Codes.",
  applicationCategory: "UtilityApplication",
  operatingSystem: "All",
};

export default function ConvertPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(convertSchema) }}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", href: "/" },
          { name: "Convert Coordinates", href: "/convert" },
        ]}
      />
      <ConvertClient />
      <SeoLinks />
    </>
  );
}
