"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

const snippets = [
  {
    label: "curl",
    code: `curl -X POST https://yourdomain.com/api/geocode \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"input": "1600 Amphitheatre Parkway, Mountain View, CA"}'`,
  },
  {
    label: "Python",
    code: `import requests

resp = requests.post(
    "https://yourdomain.com/api/geocode",
    headers={
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json",
    },
    json={"input": "1600 Amphitheatre Parkway, Mountain View, CA"},
)
print(resp.json())`,
  },
  {
    label: "JavaScript",
    code: `const resp = await fetch("https://yourdomain.com/api/geocode", {
  method: "POST",
  headers: {
    Authorization: "Bearer YOUR_API_KEY",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ input: "1600 Amphitheatre Parkway, Mountain View, CA" }),
});
const data = await resp.json();
console.log(data);`,
  },
];

export function CodeSnippets() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copySnippet = async (index: number) => {
    await navigator.clipboard.writeText(snippets[index].code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {snippets.map((snippet, i) => (
        <div key={snippet.label}>
          <p className="text-sm font-medium mb-2">{snippet.label}</p>
          <div className="relative">
            <pre className="bg-muted rounded-lg p-3 text-xs font-mono overflow-x-auto whitespace-pre">
              {snippet.code}
            </pre>
            <Button
              size="sm"
              variant="outline"
              className="absolute top-2 right-2"
              onClick={() => copySnippet(i)}
            >
              {copiedIndex === i ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
