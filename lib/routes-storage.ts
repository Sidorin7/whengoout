// Хранилище сохранённых маршрутов поверх Supabase (таблица routes, RLS по user_id).

"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { SavedRoute } from "./types";

export function generateRouteId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `route-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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

  const upsertRoute = useCallback(async (route: SavedRoute) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Сессия истекла — войдите заново.");
      return;
    }

    const { error: upsertError } = await supabase.from("routes").upsert(toRow(route, user.id));
    if (upsertError) {
      setError(upsertError.message);
      return;
    }
    setError(null);
    setRoutes((prev) => {
      const idx = prev.findIndex((r) => r.id === route.id);
      return idx >= 0 ? prev.map((r, i) => (i === idx ? route : r)) : [...prev, route];
    });
  }, []);

  const deleteRoute = useCallback(async (id: string) => {
    const supabase = createClient();
    const { error: deleteError } = await supabase.from("routes").delete().eq("id", id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setError(null);
    setRoutes((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return { routes, loading, error, upsertRoute, deleteRoute };
}
