import { lookupIp } from "./iplocate";

export interface IpRiskAssessment {
  isVpn: boolean;
  isProxy: boolean;
  isTor: boolean;
  isHosting: boolean;
  riskLevel: "low" | "medium" | "high";
}

/**
 * Assess abuse risk for a given IP address using IPLocate.io threat data.
 *
 * riskLevel logic:
 *  - 'high'   → IP is Tor exit node or hosted environment (datacenter / botnet).
 *  - 'medium' → IP is a VPN or public proxy.
 *  - 'low'    → Residential / clean IP (or we could not determine).
 *
 * Usage in route handlers:
 *
 *   const risk = await assessIpRisk(clientIp);
 *   if (risk.riskLevel === 'high') {
 *     // Stricter anonymous free-tier quota (e.g. 50 rows instead of 500).
 *     // These users must sign up with a verified email before receiving the
 *     // full free quota. This is a fraud-prevention measure, not a hard block.
 *   } else if (risk.riskLevel === 'medium') {
 *     // Moderate quota (e.g. 200 rows) — VPNs/proxies are often legitimate
 *     // privacy users, but they can also be used to cycle IPs.
 *   }
 *   // Low-risk IPs receive the standard anonymous free-tier allowance.
 */
export async function assessIpRisk(ip: string): Promise<IpRiskAssessment> {
  const data = await lookupIp(ip);

  const isVpn = data?.is_vpn ?? false;
  const isProxy = data?.is_proxy ?? false;
  const isTor = data?.is_tor ?? false;
  const isHosting = data?.is_hosting ?? false;

  let riskLevel: IpRiskAssessment["riskLevel"] = "low";

  if (isTor || isHosting) {
    riskLevel = "high";
  } else if (isVpn || isProxy) {
    riskLevel = "medium";
  }

  return { isVpn, isProxy, isTor, isHosting, riskLevel };
}
