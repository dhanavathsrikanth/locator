import type { Metadata } from "next";
import BatchClient from "./batch-client";

export const metadata: Metadata = {
  title: "Batch Convert — Locator",
  description:
    "Upload CSV or XLSX files for bulk coordinate conversion (DD, DMS, UTM, MGRS) or address geocoding. No login required for the free tier.",
  alternates: { canonical: "/batch" },
};

function SeoLinks() {
  return (
    <div className="mx-auto max-w-5xl px-5 pb-12">
      <div className="rounded-lg border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Learn more: </span>
          <a href="/geocoding-api-for-csv" className="underline underline-offset-2 hover:text-foreground">Geocoding API for CSV upload</a>
          {" — "}
          <a href="/real-estate-bulk-geocoding" className="underline underline-offset-2 hover:text-foreground">MLS bulk geocoding for real estate</a>
          {" — "}
          <a href="/delivery-route-geocoding" className="underline underline-offset-2 hover:text-foreground">Delivery route geocoding</a>
          {" — "}
          <a href="/geocode-google-sheets" className="underline underline-offset-2 hover:text-foreground">Geocode from Google Sheets</a>
        </p>
      </div>
    </div>
  );
}

export default function BatchPage() {
  return (
    <>
      <BatchClient />
      <SeoLinks />
    </>
  );
}
