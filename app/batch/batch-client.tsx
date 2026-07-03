"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { detectAndConvert, computeAll } from "@/lib/coordinates";
import {
  Upload,
  FileSpreadsheet,
  Download,
  Loader2,
  MapPin,
  AlertCircle,
} from "lucide-react";

type ColumnRole = "lat" | "lon" | "address" | "coord" | "ignore";

interface ColumnMapping {
  inputColumn: string;
  role: ColumnRole;
}

type OutputFormat = "dd" | "dms" | "utm" | "mgrs" | "geocode";

interface TemplateDef {
  label: string;
  columns: string[];
  expectedRoles: Record<string, ColumnRole>;
  formats: OutputFormat[];
}

const TEMPLATES: Record<string, TemplateDef> = {
  mls: {
    label: "Real estate MLS export",
    columns: ["address", "price", "beds", "baths", "sqft", "latitude", "longitude"],
    expectedRoles: { latitude: "lat", longitude: "lon", address: "address" },
    formats: ["dd", "utm"],
  },
  delivery: {
    label: "Delivery route CSV",
    columns: ["address", "customer_name", "phone", "order_id"],
    expectedRoles: { address: "address" },
    formats: ["geocode", "dd"],
  },
  drone: {
    label: "Drone/GIS flight log",
    columns: ["latitude", "longitude", "altitude", "speed", "heading", "timestamp"],
    expectedRoles: { latitude: "lat", longitude: "lon" },
    formats: ["dd", "mgrs"],
  },
  survey: {
    label: "Survey field sheet",
    columns: ["point_id", "northing", "easting", "zone", "elevation"],
    expectedRoles: { northing: "lat", easting: "lon" },
    formats: ["utm", "dd"],
  },
};

const ROLE_LABELS: Record<ColumnRole, string> = {
  lat: "Latitude",
  lon: "Longitude",
  address: "Address",
  coord: "Coordinate",
  ignore: "Ignore",
};

const OUTPUT_LABELS: Record<OutputFormat, string> = {
  dd: "Decimal Degrees",
  dms: "DMS",
  utm: "UTM",
  mgrs: "MGRS",
  geocode: "Geocode address to coordinates",
};

const FORMAT_KEYWORDS: Partial<Record<ColumnRole, string[]>> = {
  lat: ["lat", "latitude", "y", "ycoord", "north", "northing"],
  lon: ["lon", "lng", "longitude", "x", "xcoord", "east", "easting"],
  address: ["address", "addr", "location", "street", "place", "city", "zip", "pincode", "postal"],
  coord: ["coord", "coordinate", "mgrs", "utm", "geohash", "pluscode", "grid", "mgr"],
};

function autoDetectRoles(columns: string[]): ColumnMapping[] {
  return columns.map((col) => {
    const lower = col.toLowerCase().replace(/[\s_-]/g, "");
    for (const [role, keywords] of Object.entries(FORMAT_KEYWORDS)) {
      if (keywords.some((kw) => lower.includes(kw))) {
        return { inputColumn: col, role: role as ColumnRole };
      }
    }
    return { inputColumn: col, role: "ignore" };
  });
}

function parseFile(
  file: File
): Promise<{ rows: Record<string, string>[]; columns: string[] }> {
  return new Promise((resolve, reject) => {
    const name = file.name.toLowerCase();

    if (name.endsWith(".csv")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: false,
          complete: (result) => {
            const rows = result.data as Record<string, string>[];
            const columns = result.meta.fields || [];
            resolve({ rows, columns });
          },
          error: reject,
        });
      };
      reader.onerror = reject;
      reader.readAsText(file);
    } else if (name.endsWith(".xlsx")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
          defval: "",
        });
        const columns = json.length > 0 ? Object.keys(json[0]) : [];
        resolve({ rows: json, columns });
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    } else {
      reject(new Error("Unsupported file type"));
    }
  });
}

function downloadCSV(rows: Record<string, unknown>[], filename: string) {
  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadXLSX(rows: Record<string, unknown>[], filename: string) {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Results");
  XLSX.writeFile(wb, filename);
}

export default function BatchClient() {
  const [file, setFile] = useState<{
    name: string;
    rows: Record<string, string>[];
    columns: string[];
  } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [outputFormats, setOutputFormats] = useState<Set<OutputFormat>>(
    new Set(["dd"])
  );
  const [template, setTemplate] = useState<string>("");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<Record<string, string>[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [quotaMsg, setQuotaMsg] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevTotalRef = useRef(0);

  const handleFile = useCallback(async (f: File) => {
    setResults(null);
    setError(null);
    setQuotaMsg(null);
    setParseError(null);
    try {
      const { rows, columns } = await parseFile(f);
      setFile({ name: f.name, rows, columns });
      setMappings(autoDetectRoles(columns));
      setProgress(0);
      prevTotalRef.current = 0;
    } catch {
      setParseError("Could not parse file. Use .csv or .xlsx.");
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);
  const handleDragLeave = useCallback(() => setDragOver(false), []);

  useEffect(() => {
    if (template && TEMPLATES[template]) {
      const t = TEMPLATES[template];
      setOutputFormats(new Set(t.formats));
    }
  }, [template]);

  const latCol = useMemo(
    () => mappings.find((m) => m.role === "lat")?.inputColumn ?? "",
    [mappings]
  );
  const lonCol = useMemo(
    () => mappings.find((m) => m.role === "lon")?.inputColumn ?? "",
    [mappings]
  );
  const addressCol = useMemo(
    () => mappings.find((m) => m.role === "address")?.inputColumn ?? "",
    [mappings]
  );
  const coordCol = useMemo(
    () => mappings.find((m) => m.role === "coord")?.inputColumn ?? "",
    [mappings]
  );

  const needsGeocode = outputFormats.has("geocode");
  const formatFormats = useMemo(
    () =>
      (["dd", "dms", "utm", "mgrs"] as OutputFormat[]).filter((f) =>
        outputFormats.has(f)
      ),
    [outputFormats]
  );
  const totalRowCount = file?.rows.length ?? 0;

  const canProcess = useMemo(() => {
    if (!file) return false;
    if (outputFormats.size === 0) return false;
    if (formatFormats.length > 0 && !latCol && !coordCol)
      return false;
    if (needsGeocode && !addressCol) return false;
    return true;
  }, [file, outputFormats, formatFormats, latCol, coordCol, needsGeocode, addressCol]);

  const processWithWorker = useCallback(
    (rows: Record<string, string>[]): Promise<Record<string, string>[]> => {
      return new Promise((resolve, reject) => {
        const worker = new Worker(
          new URL("./batch-worker.ts", import.meta.url)
        );
        worker.onmessage = (e) => {
          const msg = e.data;
          if (msg.type === "complete") {
            resolve(msg.results);
            worker.terminate();
          } else if (msg.type === "error") {
            reject(new Error(msg.error));
            worker.terminate();
          }
        };
        worker.onerror = (err) => {
          reject(err);
          worker.terminate();
        };
        worker.postMessage({
          rows,
          latCol,
          lonCol,
          formats: formatFormats,
        });
      });
    },
    [latCol, lonCol, formatFormats]
  );

  const handleConvert = useCallback(async () => {
    if (!file || !canProcess) return;
    setProcessing(true);
    setProgress(0);
    setError(null);
    setQuotaMsg(null);
    setResults(null);

    const allResults: Record<string, string>[] = [];
    let processedCount = 0;

    try {
      const rows = file.rows;

      if (formatFormats.length > 0 && coordCol) {
        for (const row of rows) {
          const raw = row[coordCol];
          if (raw) {
            const parsed = detectAndConvert(raw);
            if (parsed) {
              row[`_parsed_lat`] = String(parsed.lat);
              row[`_parsed_lon`] = String(parsed.lon);
            }
          }
        }
      }

      if (formatFormats.length > 0) {
        const effectiveLatCol =
          coordCol && !latCol ? `_parsed_lat` : latCol;
        const effectiveLonCol =
          coordCol && !lonCol ? `_parsed_lon` : lonCol;

        const chunkSize = 200;
        for (let i = 0; i < rows.length; i += chunkSize) {
          const chunk = rows.slice(i, i + chunkSize);
          const result = await processWithWorker(chunk);
          allResults.push(...result);
          processedCount += chunk.length;
          setProgress(Math.round((processedCount / rows.length) * 50));
        }
      } else {
        allResults.push(
          ...rows.map((r) => ({ ...r }))
        );
        setProgress(50);
      }

      if (needsGeocode) {
        const geoRows = file.rows.filter((r) => r[addressCol]?.trim());
        const totalGeo = geoRows.length;
        let geoDone = 0;

        for (let i = 0; i < geoRows.length; i += 10) {
          const batch = geoRows.slice(i, i + 10);
          const addresses = batch.map((r) => r[addressCol]);

          const res = await fetch("/api/batch/geocode", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ addresses }),
          });

          if (res.status === 429) {
            const data = await res.json();
            setQuotaMsg(data.message || "Quota exceeded");
            break;
          }

          if (!res.ok) {
            throw new Error("Geocoding request failed");
          }

          const data = await res.json();
          for (let j = 0; j < batch.length; j++) {
            const geoResult = data.results?.[j];
            if (geoResult) {
              existingRowLoop: for (const existing of allResults) {
                if (
                  existing[addressCol] === batch[j][addressCol]
                ) {
                  existing[`geocoded_lat`] =
                    geoResult.lat != null
                      ? String(geoResult.lat)
                      : "";
                  existing[`geocoded_lon`] =
                    geoResult.lon != null
                      ? String(geoResult.lon)
                      : "";
                  break existingRowLoop;
                }
              }
            }
          }

          geoDone += batch.length;
          setProgress(
            50 + Math.round((geoDone / totalGeo) * 50)
          );
        }
      }

      setProgress(100);
      setResults(allResults);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Processing failed";
      setError(msg);
    } finally {
      setProcessing(false);
    }
  }, [
    file,
    canProcess,
    formatFormats,
    coordCol,
    latCol,
    lonCol,
    needsGeocode,
    addressCol,
    processWithWorker,
  ]);

  const validationMsg = useMemo(() => {
    if (!file) return "";
    if (outputFormats.size === 0) return "Select at least one output format";
    if (formatFormats.length > 0 && !latCol && !lonCol && !coordCol)
      return 'Map a Latitude, Longitude, or Coordinate column for format conversion';
    if (needsGeocode && !addressCol)
      return 'Map an Address column for geocoding';
    return "";
  }, [file, outputFormats, formatFormats, latCol, lonCol, coordCol, needsGeocode, addressCol]);

  return (
    <div className="flex-1 w-full flex flex-col gap-6 max-w-5xl mx-auto p-4 sm:p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Batch Convert</h1>
        <p className="text-muted-foreground text-sm">
          Upload CSV or XLSX files for bulk coordinate conversion or address
          geocoding
        </p>
      </div>

      {parseError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {parseError}
        </div>
      )}

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`rounded-lg border-2 border-dashed p-10 text-center cursor-pointer transition-colors ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-border bg-card/50 hover:border-primary/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
        <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
        <p className="font-medium">
          {file
            ? file.name
            : "Drop a .csv or .xlsx file here, or click to browse"}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {file ? `${file.rows.length} rows loaded` : "Supports CSV and XLSX"}
        </p>
      </div>

      {file && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              Template:
            </span>
            <select
              value={template}
              onChange={(e) => {
                setTemplate(e.target.value);
                if (e.target.value && TEMPLATES[e.target.value]) {
                  const t = TEMPLATES[e.target.value];
                  const cols = file.columns;
                  const mapped: ColumnMapping[] = cols.map((c) => {
                    const lower = c.toLowerCase().replace(/[\s_-]/g, "");
                    let role: ColumnRole = "ignore";
                    for (const [rk, rv] of Object.entries(
                      t.expectedRoles
                    )) {
                      if (lower.includes(rk.toLowerCase())) {
                        role = rv;
                        break;
                      }
                    }
                    return { inputColumn: c, role };
                  });
                  setMappings(mapped);
                }
              }}
              className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm"
            >
              <option value="">None</option>
              {Object.entries(TEMPLATES).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-lg border bg-card">
            <div className="p-3 border-b">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Preview — first {Math.min(5, file.rows.length)} of{" "}
                {file.rows.length} rows
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/50">
                    {file.columns.map((col) => (
                      <th
                        key={col}
                        className="text-left p-2 font-medium text-muted-foreground whitespace-nowrap"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {file.rows.slice(0, 5).map((row, i) => (
                    <tr
                      key={i}
                      className="border-b last:border-0 hover:bg-muted/30"
                    >
                      {file.columns.map((col) => (
                        <td
                          key={col}
                          className="p-2 truncate max-w-[200px]"
                        >
                          {row[col]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4 space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Column Mapping
            </h2>
            {mappings.map((m, i) => (
              <div
                key={m.inputColumn}
                className="flex items-center gap-3 text-sm"
              >
                <span className="w-40 truncate font-mono text-xs">
                  {m.inputColumn}
                </span>
                <select
                  value={m.role}
                  onChange={(e) => {
                    const next = [...mappings];
                    next[i] = {
                      ...next[i],
                      role: e.target.value as ColumnRole,
                    };
                    setMappings(next);
                  }}
                  className="rounded-lg border border-input bg-background px-2 py-1 text-xs"
                >
                  {(
                    [
                      "lat",
                      "lon",
                      "address",
                      "coord",
                      "ignore",
                    ] as ColumnRole[]
                  ).map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="rounded-lg border bg-card p-4 space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Output Formats
            </h2>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  "dd",
                  "dms",
                  "utm",
                  "mgrs",
                  "geocode",
                ] as OutputFormat[]
              ).map((fmt) => {
                const active = outputFormats.has(fmt);
                return (
                  <button
                    key={fmt}
                    onClick={() => {
                      const next = new Set(outputFormats);
                      if (active) next.delete(fmt);
                      else next.add(fmt);
                      setOutputFormats(next);
                    }}
                    className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-muted-foreground border-border hover:border-primary/50"
                    }`}
                  >
                    {OUTPUT_LABELS[fmt]}
                  </button>
                );
              })}
            </div>
          </div>

          {validationMsg && (
            <div className="flex items-center gap-2 text-sm text-amber-500">
              <AlertCircle className="w-4 h-4" />
              {validationMsg}
            </div>
          )}

          {quotaMsg && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-600 dark:text-amber-400">
                  Quota reached
                </p>
                <p className="text-muted-foreground mt-1">{quotaMsg}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <button
            onClick={handleConvert}
            disabled={!canProcess || processing}
            className="w-full sm:w-auto rounded-lg bg-primary text-primary-foreground px-6 py-2.5 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing... {progress}%
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4" />
                Convert {totalRowCount} row{totalRowCount !== 1 ? "s" : ""}
              </>
            )}
          </button>

          {processing && (
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {results && (
            <>
              <div className="rounded-lg border bg-card">
                <div className="p-3 border-b flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Results — {results.length} rows
                  </span>
                </div>
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-card">
                      <tr className="border-b bg-muted/50">
                        {Object.keys(results[0] || {}).map((col) => (
                          <th
                            key={col}
                            className="text-left p-2 font-medium text-muted-foreground whitespace-nowrap"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {results.slice(0, 100).map((row, i) => (
                        <tr
                          key={i}
                          className="border-b last:border-0 hover:bg-muted/30"
                        >
                          {Object.keys(results[0] || {}).map((col) => (
                            <td
                              key={col}
                              className="p-2 truncate max-w-[200px]"
                            >
                              {row[col]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {results.length > 100 && (
                  <div className="p-3 text-center text-xs text-muted-foreground border-t">
                    Showing first 100 rows. Download the full file below.
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    const baseName = file.name.replace(/\.[^.]+$/, "");
                    downloadCSV(
                      results,
                      `${baseName}_converted.csv`
                    );
                  }}
                  className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download CSV
                </button>
                <button
                  onClick={() => {
                    const baseName = file.name.replace(/\.[^.]+$/, "");
                    downloadXLSX(
                      results,
                      `${baseName}_converted.xlsx`
                    );
                  }}
                  className="rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent transition-colors flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Download XLSX
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
