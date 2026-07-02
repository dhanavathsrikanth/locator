import type { Metadata } from "next";
import NearestPumpsClient from "./nearest-pumps-client";

export const metadata: Metadata = {
  title: "Nearest Petrol Pumps — Locator",
};

export default function NearestPumpsPage() {
  return <NearestPumpsClient />;
}
