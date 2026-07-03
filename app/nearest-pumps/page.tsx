import type { Metadata } from "next";
import NearestPumpsClient from "./nearest-pumps-client";

export const metadata: Metadata = {
  title: "Nearest Petrol Pumps — Locator",
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

export default function NearestPumpsPage() {
  return (
    <>
      <NearestPumpsClient />
      <SeoLinks />
    </>
  );
}
