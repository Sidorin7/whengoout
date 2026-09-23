// Хранилище общих настроек поверх Supabase (таблица settings, одна строка на пользователя).

"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export const DEFAULT_BUFFER_MINUTES = 10;

export interface Settings {
  defaultBufferMinutes: number;
}

const DEFAULT_SETTINGS: Settings = { defaultBufferMinutes: DEFAULT_BUFFER_MINUTES };

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    supabase
      .from("settings")
      .select("default_buffer_minutes")
      .maybeSingle()
      .then(({ data, error: fetchError }) => {
        if (cancelled) return;
        if (fetchError) {
          setError(fetchError.message);
        } else if (data) {
          setSettings({ defaultBufferMinutes: data.default_buffer_minutes });
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const setDefaultBufferMinutes = useCallback(async (minutes: number) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Сессия истекла — войдите заново.");
      return;
    }

    const { error: upsertError } = await supabase
      .from("settings")
      .upsert({ user_id: user.id, default_buffer_minutes: minutes });
    if (upsertError) {
      setError(upsertError.message);
      return;
    }
    setError(null);
    setSettings({ defaultBufferMinutes: minutes });
  }, []);

  return { settings, loading, error, setDefaultBufferMinutes };
}
