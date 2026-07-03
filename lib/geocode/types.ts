export interface GeocodeResult {
  input: string;
  matched_format: "address" | "dd" | "dms" | "ddm" | "utm" | "mgrs" | "geohash" | "pluscode";
  lat: number;
  lng: number;
  formatted_address: string;
  confidence: number;
  provider: "nominatim" | "opencage";
  cached: boolean;
}

export interface GeocodeError {
  input: string;
  error: string;
}

export interface ProviderResponse {
  lat: number;
  lng: number;
  formatted_address: string;
  confidence: number;
}
