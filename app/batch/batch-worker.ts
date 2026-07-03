import { computeAll } from "../../lib/coordinates";

interface ConvertRow {
  [key: string]: string;
}

interface WorkerInput {
  rows: ConvertRow[];
  latCol: string;
  lonCol: string;
  formats: string[];
}

interface ProgressMessage {
  type: "progress";
  current: number;
  total: number;
}

interface CompleteMessage {
  type: "complete";
  results: ConvertRow[];
}

interface ErrorMessage {
  type: "error";
  error: string;
}

type WorkerMessage = ProgressMessage | CompleteMessage | ErrorMessage;

self.onmessage = (e: MessageEvent<WorkerInput>) => {
  const { rows, latCol, lonCol, formats } = e.data;

  try {
    const results: ConvertRow[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row: ConvertRow = { ...rows[i] };
      const latRaw = latCol ? row[latCol] : undefined;
      const lonRaw = lonCol ? row[lonCol] : undefined;

      if (latRaw !== undefined && lonRaw !== undefined) {
        const lat = parseFloat(latRaw);
        const lon = parseFloat(lonRaw);
        if (!isNaN(lat) && !isNaN(lon)) {
          const converted = computeAll(lat, lon, "dd");
          for (const fmt of formats) {
            const key = fmt as keyof typeof converted;
            if (typeof converted[key] === "string") {
              row[`converted_${fmt}`] = converted[key] as string;
            } else if (fmt === "dd") {
              row.converted_dd = converted.dd;
            }
          }
        }
      }

      results.push(row);

      if ((i + 1) % 50 === 0 || i === rows.length - 1) {
        const msg: ProgressMessage = {
          type: "progress",
          current: i + 1,
          total: rows.length,
        };
        self.postMessage(msg);
      }
    }

    const msg: CompleteMessage = { type: "complete", results };
    self.postMessage(msg);
  } catch (err) {
    const msg: ErrorMessage = { type: "error", error: String(err) };
    self.postMessage(msg);
  }
};
