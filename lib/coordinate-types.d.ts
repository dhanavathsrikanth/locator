declare module "utm-latlng" {
  interface UTMLatLngResult {
    lat: number;
    lng: number;
  }

  interface UTMResult {
    Easting: number;
    Northing: number;
    ZoneNumber: number;
    ZoneLetter: string;
  }

  export default class UtmLatLng {
    convertLatLngToUtm(lat: number, lng: number, precision?: number): UTMResult;
    convertUtmToLatLng(
      UTMEasting: number,
      UTMNorthing: number,
      UTMZoneNumber: number,
      UTMZoneLetter: string
    ): UTMLatLngResult;
  }
}

declare module "open-location-code" {
  interface OpenLocationCodeResult {
    latitudeLo: number;
    longitudeLo: number;
    latitudeHi: number;
    longitudeHi: number;
    codeLength: number;
    latitudeCenter: number;
    longitudeCenter: number;
  }

  export class OpenLocationCode {
    encode(lat: number, lng: number, codeLength?: number): string;
    decode(code: string): OpenLocationCodeResult;
    isValid(code: string): boolean;
    isShort(code: string): boolean;
    isFull(code: string): boolean;
    shorten(code: string, lat: number, lng: number): string;
    recoverNearest(code: string, lat: number, lng: number): string;
  }
}
