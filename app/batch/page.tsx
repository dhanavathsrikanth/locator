import type { Metadata } from "next";
import BatchClient from "./batch-client";

export const metadata: Metadata = {
  title: "Batch Convert — Locator",
  description:
    "Upload CSV or XLSX files for bulk coordinate conversion (DD, DMS, UTM, MGRS) or address geocoding. No login required for the free tier.",
};

export default function BatchPage() {
  return <BatchClient />;
}
