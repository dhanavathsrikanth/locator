"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useRef } from "react";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

type RealtimeEvent = "INSERT" | "UPDATE" | "DELETE" | "*";

interface UseRealtimeOptions<T extends { [key: string]: any }> {
  table: string;
  event?: RealtimeEvent;
  filter?: string;
  onPayload: (payload: RealtimePostgresChangesPayload<T>) => void;
}

export function useRealtimeSubscription<T extends { [key: string]: any } = any>({
  table,
  event = "*",
  filter,
  onPayload,
}: UseRealtimeOptions<T>) {
  const onPayloadRef = useRef(onPayload);
  onPayloadRef.current = onPayload;

  useEffect(() => {
    const supabase = createClient();

    const channelConfig: Record<string, any> = {
      event,
      schema: "public",
      table,
    };

    if (filter) {
      channelConfig.filter = filter;
    }

    const channel = supabase
      .channel(`realtime-${table}`)
      .on(
        "postgres_changes" as any,
        channelConfig,
        (payload: RealtimePostgresChangesPayload<T>) => {
          onPayloadRef.current(payload);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, event, filter]);
}
