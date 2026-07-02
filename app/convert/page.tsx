import type { Metadata } from "next";
import ConvertClient from "./convert-client";

export const metadata: Metadata = {
  title: "Convert Coordinates — Locator",
  description:
    "Free online coordinate converter. Convert between Decimal Degrees, DMS, DDM, UTM, MGRS, Geohash, and Plus Codes instantly. No login required.",
};

export default function ConvertPage() {
  return <ConvertClient />;
}
