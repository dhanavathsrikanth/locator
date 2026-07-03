import { describe, it, expect, vi, beforeEach } from "vitest";
import { assessIpRisk } from "./ip-risk";
import { clearIpCache } from "./iplocate";

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

describe("assessIpRisk", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    clearIpCache();
  });

  it("returns low risk for a clean residential IP", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ip: "1.2.3.4",
        is_proxy: false,
        is_vpn: false,
        is_tor: false,
        is_hosting: false,
      }),
    });

    const result = await assessIpRisk("1.2.3.4");

    expect(result).toEqual({
      isVpn: false,
      isProxy: false,
      isTor: false,
      isHosting: false,
      riskLevel: "low",
    });
  });

  it("returns medium risk when IP is a VPN", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ip: "10.0.0.1",
        is_proxy: false,
        is_vpn: true,
        is_tor: false,
        is_hosting: false,
      }),
    });

    const result = await assessIpRisk("10.0.0.1");

    expect(result.isVpn).toBe(true);
    expect(result.riskLevel).toBe("medium");
  });

  it("returns medium risk when IP is a public proxy", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ip: "10.0.0.2",
        is_proxy: true,
        is_vpn: false,
        is_tor: false,
        is_hosting: false,
      }),
    });

    const result = await assessIpRisk("10.0.0.2");

    expect(result.isProxy).toBe(true);
    expect(result.riskLevel).toBe("medium");
  });

  it("returns high risk when IP is a Tor exit node", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ip: "10.0.0.3",
        is_proxy: false,
        is_vpn: false,
        is_tor: true,
        is_hosting: false,
      }),
    });

    const result = await assessIpRisk("10.0.0.3");

    expect(result.isTor).toBe(true);
    expect(result.riskLevel).toBe("high");
  });

  it("returns high risk when IP is a hosting / datacenter IP", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ip: "10.0.0.4",
        is_proxy: false,
        is_vpn: false,
        is_tor: false,
        is_hosting: true,
      }),
    });

    const result = await assessIpRisk("10.0.0.4");

    expect(result.isHosting).toBe(true);
    expect(result.riskLevel).toBe("high");
  });

  it("returns low risk when IPLocate API call fails", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 429 });

    const result = await assessIpRisk("10.0.0.5");

    expect(result).toEqual({
      isVpn: false,
      isProxy: false,
      isTor: false,
      isHosting: false,
      riskLevel: "low",
    });
  });

  it("caches the IPLocate result so the same IP only triggers one fetch", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ip: "10.0.0.6",
        is_proxy: false,
        is_vpn: true,
        is_tor: false,
        is_hosting: false,
      }),
    });

    const r1 = await assessIpRisk("10.0.0.6");
    const r2 = await assessIpRisk("10.0.0.6");

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(r1.riskLevel).toBe("medium");
    expect(r2.riskLevel).toBe("medium");
  });

  it("handles missing optional fields gracefully", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ip: "10.0.0.7",
      }),
    });

    const result = await assessIpRisk("10.0.0.7");

    expect(result).toEqual({
      isVpn: false,
      isProxy: false,
      isTor: false,
      isHosting: false,
      riskLevel: "low",
    });
  });
});
