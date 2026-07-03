import type { Metadata } from "next";
import ConvertClient from "./convert-client";

export const metadata: Metadata = {
  title: "Convert Coordinates — Locator",
  description:
    "Free online coordinate converter. Convert between Decimal Degrees, DMS, DDM, UTM, MGRS, Geohash, and Plus Codes instantly. No login required.",
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

export default function ConvertPage() {
  return (
    <>
      <ConvertClient />
      <SeoLinks />
    </>
  );
}
