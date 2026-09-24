"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { inputClass } from "@/components/board-styles";
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
      <p className="px-5 py-5 text-sm text-muted-foreground sm:px-6">
        Расписание пустое. Табло не угадает само — добавь время пар в редактировании.
      </p>
    );
  }

  const departures = calculateAllDepartures(route.schedule, effectiveBuffer, route.travelMinutes);

  return (
    <ul>
      {departures.map(({ entry, arriveAt, departAt }, i) => {
        const today = isToday(entry.weekday, now);
        return (
          <li
            key={`${entry.weekday}-${entry.time}-${i}`}
            data-today={today || undefined}
            className="grid grid-cols-[3rem_1fr_auto] items-center gap-3 border-t border-border/60 px-5 py-3 data-[today]:bg-primary/10 sm:grid-cols-[3.5rem_1fr_auto] sm:gap-5 sm:px-6 sm:py-4"
          >
            <span
              className={
                "font-mono text-xs font-semibold tracking-wider uppercase sm:text-sm " +
                (today ? "text-primary" : "text-muted-foreground")
              }
            >
              {WEEKDAY_LABELS[entry.weekday]}
              {today && <span className="block text-[10px] tracking-widest">сегодня</span>}
            </span>
            <span className="text-sm text-muted-foreground sm:text-base">
              пара в{" "}
              <span className="font-mono text-foreground tabular-nums">{formatTime(arriveAt)}</span>
            </span>
            <span className="flex items-center gap-2 sm:gap-3">
              <span className="hidden font-mono text-xs tracking-wider text-muted-foreground uppercase sm:inline">
                выйти
              </span>
              <span
                className={
                  "rounded-md px-2 py-0.5 font-mono text-lg font-semibold tabular-nums sm:text-2xl " +
                  (today ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground")
                }
              >
                {formatTime(departAt)}
              </span>
            </span>
          </li>
        );
      })}
    </ul>
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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">сейчас</p>
          <p className="font-mono text-4xl font-semibold text-primary tabular-nums sm:text-5xl">
            {formatTime(now)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Label htmlFor="default-buffer" className="max-w-[16ch] text-sm leading-tight text-muted-foreground">
            Запас на «ой, ключи забыл», мин
          </Label>
          <Input
            id="default-buffer"
            type="number"
            min={0}
            className={inputClass + " w-20 text-center font-mono tabular-nums"}
            value={bufferDraft}
            onChange={(e) => setBufferDraft(e.target.value)}
            onBlur={commitBufferDraft}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
            }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {routes.map((route) => (
          <article
            key={route.id}
            className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/30"
          >
            <div className="flex items-center gap-3 bg-secondary/60 px-5 py-4 sm:px-6">
              <div className="min-w-0 flex-1">
                <h2 className="truncate font-heading text-lg font-bold tracking-tight sm:text-xl">
                  {route.name}
                </h2>
                <p className="mt-0.5 font-mono text-xs tracking-wide text-muted-foreground uppercase">
                  в пути {route.travelMinutes} мин · запас{" "}
                  {route.bufferMinutes ?? settings.defaultBufferMinutes} мин
                </p>
              </div>
              <button
                type="button"
                aria-label="Редактировать маршрут"
                className="grid size-10 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                onClick={() => onEdit(route)}
              >
                <Pencil className="size-4" />
              </button>
              <button
                type="button"
                aria-label="Удалить маршрут"
                className="grid size-10 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                onClick={() => onDelete(route)}
              >
                <Trash2 className="size-4" />
              </button>
            </div>
            <RouteSchedule route={route} defaultBufferMinutes={settings.defaultBufferMinutes} now={now} />
          </article>
        ))}

        <button
          type="button"
          onClick={onAdd}
          className="group flex h-16 items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border font-heading text-base font-bold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <Plus className="size-5 transition-transform group-hover:rotate-90" />
          Ещё маршрут
        </button>
      </div>
    </div>
  );
}
