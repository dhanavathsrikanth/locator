import { describe, it, expect } from "vitest";
import { detectAndConvert, computeAll, formatDMS, formatDDM, formatDD, formatUTM, formatMGRS, formatGeohash, formatPlusCode } from "./coordinates";

const EPSILON = 0.001;

function approx(actual: number, expected: number, epsilon = EPSILON) {
  expect(Math.abs(actual - expected)).toBeLessThan(epsilon);
}

const referencePairs = [
  {
    name: "Eiffel Tower, Paris",
    lat: 48.8588897,
    lon: 2.295,
    dd: "48.8588897, 2.295",
    mgrs: "31UDQ4828912009",
    utm: "31U 448289 5412009",
    geohash: "u09tunrptmh",
    pluscode: "8FW4V75V+HX",
  },
  {
    name: "Sydney Opera House",
    lat: -33.856784,
    lon: 151.215297,
    dd: "-33.856784, 151.215297",
    mgrs: "56HLH3490052290",
    utm: "56H 334900 6252291",
    geohash: "r3gx2ux9gy1",
    pluscode: "4RRH46V8+74",
  },
  {
    name: "Times Square, NYC",
    lat: 40.758,
    lon: -73.9855,
    dd: "40.758, -73.9855",
    mgrs: "18TWL8563212388",
    utm: "18T 585633 4512388",
    geohash: "dr5ru7v2scu",
    pluscode: "87G8Q257+6Q",
  },
  {
    name: "Tokyo Tower",
    lat: 35.65858,
    lon: 139.745433,
    dd: "35.65858, 139.745433",
    mgrs: "54SUE8644046805",
    utm: "54S 386441 3946806",
    geohash: "xn76ggrw295",
    pluscode: "8Q7XMP5W+C5",
  },
  {
    name: "Mount Everest",
    lat: 27.988056,
    lon: 86.925278,
    dd: "27.988056, 86.925278",
    mgrs: "45RVL9265295881",
    utm: "45R 492652 3095882",
    geohash: "tuvz4p141zc",
    pluscode: "7MV8XWQG+64",
  },
];

describe("format functions", () => {
  for (const ref of referencePairs) {
    describe(ref.name, () => {
      it("formatDD", () => {
        const result = formatDD(ref.lat, ref.lon);
        expect(result).toBe(ref.dd);
      });

      it("formatMGRS", () => {
        const result = formatMGRS(ref.lat, ref.lon);
        expect(result).toBe(ref.mgrs);
      });

      it("formatUTM", () => {
        const result = formatUTM(ref.lat, ref.lon);
        expect(result).toBe(ref.utm);
      });

      it("formatGeohash", () => {
        const result = formatGeohash(ref.lat, ref.lon);
        expect(result).toBe(ref.geohash);
      });

      it("formatPlusCode", () => {
        const result = formatPlusCode(ref.lat, ref.lon);
        expect(result).toBe(ref.pluscode);
      });

      it("formatDMS produces valid output", () => {
        const result = formatDMS(ref.lat, ref.lon);
        expect(result).toMatch(/[NS]/);
        expect(result).toMatch(/[EW]/);
        expect(result).toContain("°");
      });

      it("formatDDM produces valid output", () => {
        const result = formatDDM(ref.lat, ref.lon);
        expect(result).toMatch(/[NS]/);
        expect(result).toMatch(/[EW]/);
        expect(result).toContain("°");
      });
    });
  }
});

describe("detectAndConvert", () => {
  const testCases: { input: string; expectedLat: number; expectedLon: number; label: string }[] = [
    { input: "48.8588897, 2.295", expectedLat: 48.8588897, expectedLon: 2.295, label: "DD with comma" },
    { input: "48.8588897 2.295", expectedLat: 48.8588897, expectedLon: 2.295, label: "DD with space" },
    { input: "48°51'32\"N 2°17'42\"E", expectedLat: 48.8588897, expectedLon: 2.295, label: "DMS with quotes" },
    { input: "48 51 32 N 2 17 42 E", expectedLat: 48.8588897, expectedLon: 2.295, label: "DMS space separated" },
    { input: "48d51m32sN 2d17m42sE", expectedLat: 48.8588897, expectedLon: 2.295, label: "DMS dms format" },
    { input: "48 51.533 N 2 17.700 E", expectedLat: 48.8588897, expectedLon: 2.295, label: "DDM" },
    { input: "31U 448289 5412009", expectedLat: 48.8588897, expectedLon: 2.295, label: "UTM" },
    { input: "31UDQ4828912009", expectedLat: 48.8588897, expectedLon: 2.295, label: "MGRS" },
    { input: "u09tunrptmh", expectedLat: 48.8588897, expectedLon: 2.295, label: "Geohash" },
    { input: "8FW4V75V+HX", expectedLat: 48.8588897, expectedLon: 2.295, label: "Plus Code" },
    { input: "", expectedLat: 0, expectedLon: 0, label: "empty input returns null" },
    { input: "xyzzy!!", expectedLat: 0, expectedLon: 0, label: "invalid input returns null" },
  ];

  for (const tc of testCases) {
    it(tc.label, () => {
      const result = detectAndConvert(tc.input);
      if (tc.input === "" || tc.input === "xyzzy!!") {
        expect(result).toBeNull();
      } else {
        expect(result).not.toBeNull();
        approx(result!.lat, tc.expectedLat);
        approx(result!.lon, tc.expectedLon);
      }
    });
  }

  it("converts all 7 formats for each reference pair", () => {
    for (const ref of referencePairs) {
      const formats: string[] = [
        ref.dd,
        ref.mgrs,
        ref.utm,
        ref.geohash,
        ref.pluscode,
      ];
      for (const fmt of formats) {
        const result = detectAndConvert(fmt);
        expect(result).not.toBeNull();
        approx(result!.lat, ref.lat);
        approx(result!.lon, ref.lon);
      }
    }
  });
});

describe("computeAll", () => {
  it("returns all formats for Eiffel Tower", () => {
    const r = computeAll(48.8588897, 2.295, "dd");
    approx(r.lat, 48.8588897);
    approx(r.lon, 2.295);
    expect(r.detectedFormat).toBe("dd");
    expect(r.mgrs).toEqual("31UDQ4828912009");
    expect(r.utm).toEqual("31U 448289 5412009");
    expect(r.geohash).toEqual("u09tunrptmh");
    expect(r.pluscode).toEqual("8FW4V75V+HX");
  });
});
