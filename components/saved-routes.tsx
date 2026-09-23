"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateAllDepartures, formatTime, isToday } from "@/lib/calculate-departure";
import type { Settings } from "@/lib/settings-storage";
import { useNow } from "@/lib/use-now";
import { WEEKDAY_LABELS, type SavedRoute } from "@/lib/types";

interface SavedRoutesProps {
  routes: SavedRoute[];
  settings: Settings;
  onSettingsChange: (minutes: number) => Promise<boolean>;
  onEdit: (route: SavedRoute) => void;
  onDelete: (route: SavedRoute) => void;
  onAdd: () => void;
}

function RouteSchedule({
  route,
  defaultBufferMinutes,
  now,
}: {
  route: SavedRoute;
  defaultBufferMinutes: number;
  now: Date;
}) {
  const effectiveBuffer = route.bufferMinutes ?? defaultBufferMinutes;

  if (route.schedule.length === 0) {
    return (
      <p className="py-1 text-sm text-muted-foreground">
        Расписание пока пустое — добавьте время в редактировании маршрута.
      </p>
    );
  }

  const departures = calculateAllDepartures(route.schedule, effectiveBuffer, route.travelMinutes);

  return (
    <div className="flex flex-col">
      {departures.map(({ entry, arriveAt, departAt }, i) => {
        const today = isToday(entry.weekday, now);
        return (
          <div
            key={`${entry.weekday}-${entry.time}-${i}`}
            data-today={today || undefined}
            className="grid grid-cols-[2.25rem_3.75rem_1fr_auto] items-baseline gap-x-2 border-t border-border/60 py-2 first:border-t-0 data-[today]:-mx-4 data-[today]:rounded-md data-[today]:border-t-0 data-[today]:bg-primary/10 data-[today]:px-4"
          >
            <span
              className={
                "text-xs font-semibold " + (today ? "text-primary" : "text-muted-foreground")
              }
            >
              {WEEKDAY_LABELS[entry.weekday]}
            </span>
            <span className="font-mono text-sm tabular-nums text-muted-foreground">
              {formatTime(arriveAt)}
            </span>
            <span className="text-xs text-muted-foreground">выйти</span>
            <span
              className={
                "text-right font-mono font-semibold tabular-nums " +
                (today ? "text-lg text-primary" : "text-base text-foreground")
              }
            >
              {formatTime(departAt)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function SavedRoutes({
  routes,
  settings,
  onSettingsChange,
  onEdit,
  onDelete,
  onAdd,
}: SavedRoutesProps) {
  const now = useNow();
  const [bufferDraft, setBufferDraft] = useState(String(settings.defaultBufferMinutes));
  // Синхронизируем черновик, когда значение меняют извне (загрузка/другая вкладка), без
  // useEffect — обновление state во время рендера при смене пропа, а не в отдельном эффекте,
  // чтобы не перезаписывать то, что пользователь печатает прямо сейчас (commit на blur).
  const [syncedBuffer, setSyncedBuffer] = useState(settings.defaultBufferMinutes);
  if (settings.defaultBufferMinutes !== syncedBuffer) {
    setSyncedBuffer(settings.defaultBufferMinutes);
    setBufferDraft(String(settings.defaultBufferMinutes));
  }

  async function commitBufferDraft() {
    const value = Number(bufferDraft);
    if (Number.isFinite(value) && value >= 0) {
      const ok = await onSettingsChange(value);
      if (!ok) setBufferDraft(String(settings.defaultBufferMinutes));
    } else {
      setBufferDraft(String(settings.defaultBufferMinutes));
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2">
        <span className="font-mono text-sm tabular-nums text-muted-foreground">
          Сейчас <span className="text-primary">{formatTime(now)}</span>
        </span>
        <div className="flex items-center gap-2">
          <Label htmlFor="default-buffer" className="text-xs text-muted-foreground">
            Запас по умолчанию, мин
          </Label>
          <Input
            id="default-buffer"
            type="number"
            min={0}
            className="w-16 font-mono tabular-nums"
            value={bufferDraft}
            onChange={(e) => setBufferDraft(e.target.value)}
            onBlur={commitBufferDraft}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
            }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {routes.map((route) => (
          <Card key={route.id}>
            <CardContent className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <h2 className="font-heading text-sm font-semibold tracking-tight sm:text-base">
                    {route.name}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    В пути {route.travelMinutes} мин, запас{" "}
                    {route.bufferMinutes ?? settings.defaultBufferMinutes} мин
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Редактировать маршрут"
                  onClick={() => onEdit(route)}
                >
                  <Pencil />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Удалить маршрут"
                  className="hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => onDelete(route)}
                >
                  <Trash2 />
                </Button>
              </div>
              <RouteSchedule route={route} defaultBufferMinutes={settings.defaultBufferMinutes} now={now} />
            </CardContent>
          </Card>
        ))}

        <Button
          type="button"
          variant="outline"
          className="w-full border-dashed"
          onClick={onAdd}
        >
          <Plus data-icon="inline-start" />
          Новый маршрут
        </Button>
      </div>
    </div>
  );
}
