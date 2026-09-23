// Хранилище сохранённых маршрутов поверх Supabase (таблица routes, RLS по user_id).

"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { SavedRoute } from "./types";

function getRandomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  const webCrypto: { getRandomValues?: (b: Uint8Array) => Uint8Array } | undefined =
    typeof crypto !== "undefined" ? crypto : undefined;
  if (webCrypto?.getRandomValues) {
    webCrypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return bytes;
}

export function generateRouteId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // Fallback for insecure contexts (e.g. http://<lan-ip>:3000) where
  // crypto.randomUUID is unavailable. `routes.id` is a Postgres `uuid`
  // column, so this must still be a valid UUID v4, not an arbitrary string.
  const bytes = getRandomBytes(16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

interface RouteRow {
  id: string;
  name: string;
  travel_minutes: number;
  buffer_minutes: number | null;
  schedule: SavedRoute["schedule"];
}

function fromRow(row: RouteRow): SavedRoute {
  return {
    id: row.id,
    name: row.name,
    travelMinutes: row.travel_minutes,
    bufferMinutes: row.buffer_minutes ?? undefined,
    schedule: row.schedule,
  };
}

function toRow(route: SavedRoute, userId: string) {
  return {
    id: route.id,
    user_id: userId,
    name: route.name,
    travel_minutes: route.travelMinutes,
    buffer_minutes: route.bufferMinutes ?? null,
    schedule: route.schedule,
  };
}

export function useRoutes() {
  const [routes, setRoutes] = useState<SavedRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    supabase
      .from("routes")
      .select("id, name, travel_minutes, buffer_minutes, schedule")
      .order("created_at", { ascending: true })
      .then(({ data, error: fetchError }) => {
        if (cancelled) return;
        if (fetchError) {
          setError(fetchError.message);
        } else {
          setRoutes((data ?? []).map(fromRow));
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const upsertRoute = useCallback(async (route: SavedRoute): Promise<boolean> => {
    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      setError("Сессия истекла — войдите заново.");
      return false;
    }

    const { error: upsertError } = await supabase.from("routes").upsert(toRow(route, user.id));
    if (upsertError) {
      setError(upsertError.message);
      return false;
    }
    setError(null);
    setRoutes((prev) => {
      const idx = prev.findIndex((r) => r.id === route.id);
      return idx >= 0 ? prev.map((r, i) => (i === idx ? route : r)) : [...prev, route];
    });
    return true;
  }, []);

  const deleteRoute = useCallback(async (id: string): Promise<boolean> => {
    const supabase = createClient();
    const { error: deleteError } = await supabase.from("routes").delete().eq("id", id);
    if (deleteError) {
      setError(deleteError.message);
      return false;
    }
    setError(null);
    setRoutes((prev) => prev.filter((r) => r.id !== id));
    return true;
  }, []);

  return { routes, loading, error, upsertRoute, deleteRoute };
}
