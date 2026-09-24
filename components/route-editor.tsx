"use client";

import { useState } from "react";
import { ArrowRight, Plus, Trash2 } from "lucide-react";
import { cardClass, inputClass, primaryButtonClass, secondaryButtonClass } from "@/components/board-styles";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateRouteId } from "@/lib/routes-storage";
import { WEEKDAYS, WEEKDAY_LABELS, type ScheduleEntry, type SavedRoute, type Weekday } from "@/lib/types";

interface RouteEditorProps {
  initialRoute?: SavedRoute;
  defaultBufferMinutes: number;
  onSaved: (route: SavedRoute) => void;
  onCancel?: () => void;
}

let entryKeySeq = 0;
function nextEntryKey(): string {
  entryKeySeq += 1;
  return `entry-${entryKeySeq}`;
}

export function RouteEditor({
  initialRoute,
  defaultBufferMinutes,
  onSaved,
  onCancel,
}: RouteEditorProps) {
  const [name, setName] = useState(initialRoute?.name ?? "");
  const [travelMinutes, setTravelMinutes] = useState(
    initialRoute ? String(initialRoute.travelMinutes) : "",
  );
  const [bufferMinutes, setBufferMinutes] = useState(
    initialRoute?.bufferMinutes !== undefined ? String(initialRoute.bufferMinutes) : "",
  );
  const [schedule, setSchedule] = useState<Array<ScheduleEntry & { key: string }>>(
    () => (initialRoute?.schedule ?? []).map((entry) => ({ ...entry, key: nextEntryKey() })),
  );

  const defaultBuffer = defaultBufferMinutes;
  const travelMinutesNumber = Number(travelMinutes);
  const isIncomplete =
    !name.trim() || !travelMinutes.trim() || !Number.isFinite(travelMinutesNumber) || travelMinutesNumber < 0;

  function updateEntry(key: string, patch: Partial<ScheduleEntry>) {
    setSchedule((prev) => prev.map((entry) => (entry.key === key ? { ...entry, ...patch } : entry)));
  }

  function removeEntry(key: string) {
    setSchedule((prev) => prev.filter((entry) => entry.key !== key));
  }

  function addEntry() {
    setSchedule((prev) => [...prev, { key: nextEntryKey(), weekday: "mon", time: "" }]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isIncomplete) return;

    const trimmedBuffer = bufferMinutes.trim();
    const bufferOverride = trimmedBuffer === "" ? undefined : Number(trimmedBuffer);

    const route: SavedRoute = {
      id: initialRoute?.id ?? generateRouteId(),
      name: name.trim(),
      travelMinutes: travelMinutesNumber,
      bufferMinutes:
        bufferOverride !== undefined && Number.isFinite(bufferOverride) ? bufferOverride : undefined,
      schedule: schedule
        .filter((entry) => entry.time.trim() !== "")
        .map(({ weekday, time }) => ({ weekday, time })),
    };
    onSaved(route);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cardClass + " flex flex-col gap-6 p-6 sm:p-8"}
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="route-name">Куда едем</Label>
        <Input
          id="route-name"
          placeholder="Школа, универ, корпус А, тренировка..."
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="route-travel-minutes">Сколько в пути, мин</Label>
          <Input
            id="route-travel-minutes"
            type="number"
            min={0}
            placeholder="30"
            className={inputClass + " font-mono tabular-nums"}
            value={travelMinutes}
            onChange={(e) => setTravelMinutes(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="route-buffer-minutes">Свой запас, мин</Label>
          <Input
            id="route-buffer-minutes"
            type="number"
            min={0}
            placeholder={`по умолчанию ${defaultBuffer}`}
            className={inputClass + " font-mono tabular-nums"}
            value={bufferMinutes}
            onChange={(e) => setBufferMinutes(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <Label>Расписание пар</Label>
          <p className="mt-1 text-sm text-muted-foreground">
            Во сколько надо быть на месте. Табло посчитает, когда выходить.
          </p>
        </div>
        {schedule.map((entry) => (
          <div key={entry.key} className="flex items-center gap-2">
            <Select
              items={WEEKDAY_LABELS}
              value={entry.weekday}
              onValueChange={(value) => updateEntry(entry.key, { weekday: value as Weekday })}
            >
              <SelectTrigger className="h-12! w-22 shrink-0 rounded-md border-foreground/25 bg-card pr-3 pl-4 font-mono text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WEEKDAYS.map((weekday) => (
                  <SelectItem key={weekday} value={weekday}>
                    {WEEKDAY_LABELS[weekday]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="time"
              className={inputClass + " flex-1 font-mono tabular-nums"}
              value={entry.time}
              onChange={(e) => updateEntry(entry.key, { time: e.target.value })}
              aria-label="Время начала пары"
            />
            <button
              type="button"
              aria-label="Удалить время"
              className="grid size-12 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              onClick={() => removeEntry(entry.key)}
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addEntry}
          className="group flex h-12 items-center justify-center gap-2 rounded-md border-[1.5px] border-dashed border-foreground/40 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <Plus className="size-4 transition-transform group-hover:rotate-90" />
          Добавить время
        </button>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        {onCancel && (
          <button type="button" className={secondaryButtonClass + " sm:flex-1"} onClick={onCancel}>
            Отмена
          </button>
        )}
        <button type="submit" className={primaryButtonClass + " sm:flex-1"} disabled={isIncomplete}>
          Сохранить маршрут
          <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </form>
  );
}
