"use client";

import { useState } from "react";
import { generateApiKey, revokeApiKey } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Key, Trash2, Loader2, Check } from "lucide-react";

interface ApiKeyRow {
  id: string;
  label: string;
  created_at: string;
  revoked_at: string | null;
}

export function ApiKeysSection({
  keys: initialKeys,
}: {
  keys: ApiKeyRow[];
}) {
  const [keys, setKeys] = useState(initialKeys);
  const [label, setLabel] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const key = await generateApiKey(label || "Default");
      setNewKey(key);
      setLabel("");
      setKeys((prev) => [
        {
          id: "pending",
          label: label || "Default",
          created_at: new Date().toISOString(),
          revoked_at: null,
        },
        ...prev,
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    setRevokingId(id);
    try {
      await revokeApiKey(id);
      setKeys((prev) => prev.filter((k) => k.id !== id));
    } catch (e) {
      console.error(e);
    } finally {
      setRevokingId(null);
    }
  };

  const copyKey = async () => {
    if (newKey) {
      await navigator.clipboard.writeText(newKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <div className="flex gap-2 mb-6">
        <Input
          placeholder="Key label (e.g. Production)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="max-w-xs"
          disabled={isGenerating}
        />
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !label.trim()}
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Key className="h-4 w-4" />
          )}
          Generate
        </Button>
      </div>

      {keys.length === 0 ? (
        <p className="text-sm text-muted-foreground">No API keys yet</p>
      ) : (
        <div className="space-y-2">
          {keys.map((key) => (
            <div
              key={key.id}
              className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium">{key.label}</p>
                <p className="text-xs text-muted-foreground">
                  Created {new Date(key.created_at).toLocaleDateString()}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRevoke(key.id)}
                disabled={revokingId === key.id}
                className="text-destructive hover:text-destructive"
              >
                {revokingId === key.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Revoke
              </Button>
            </div>
          ))}
        </div>
      )}

      {newKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card border border-border rounded-xl shadow-lg max-w-lg w-full mx-4 p-6 space-y-4">
            <h3 className="text-lg font-semibold">New API Key</h3>
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-sm text-destructive">
              Save this key now. You won&apos;t be able to see it again.
            </div>
            <div className="relative">
              <pre className="bg-muted rounded-lg p-3 text-xs font-mono break-all select-all">
                {newKey}
              </pre>
              <Button
                size="sm"
                variant="outline"
                className="absolute top-2 right-2"
                onClick={copyKey}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setNewKey(null)}>Done</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
