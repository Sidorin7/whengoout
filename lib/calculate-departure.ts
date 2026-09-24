// Чистая логика расчёта времени выхода. Никаких сетевых вызовов — только даты и форматирование.

import { WEEKDAYS, type ScheduleEntry, type Weekday } from "./types";

export interface DepartureInput {
  /** Момент, к которому нужно прибыть. */
  arriveAt: Date;
  bufferMinutes: number;
  durationSeconds: number;
}

export interface DepartureOutput {
  departAt: Date;
  routeArrivalAt: Date;
}

/**
 * выход = T - R - B
 * routeArrivalAt — момент прибытия по маршруту (T - B), от него отсчитывается R назад.
 */
export function calculateDeparture({
  arriveAt,
  bufferMinutes,
  durationSeconds,
}: DepartureInput): DepartureOutput {
  const routeArrivalAt = new Date(arriveAt.getTime() - bufferMinutes * 60_000);
  const departAt = new Date(routeArrivalAt.getTime() - durationSeconds * 1000);
  return { departAt, routeArrivalAt };
}

export class InvalidTimeError extends Error {}

function parseTime(timeStr: string): { hours: number; minutes: number } {
  const match = /^(\d{1,2}):(\d{2})$/.exec(timeStr.trim());
  if (!match) {
    throw new InvalidTimeError(`Некорректный формат времени: "${timeStr}"`);
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) {
    throw new InvalidTimeError(`Некорректное время: "${timeStr}"`);
  }
  return { hours, minutes };
}

/** Понедельник = 0 ... воскресенье = 6, в отличие от Date.getDay() (вс = 0). */
function weekdayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

export function isToday(weekday: Weekday, now: Date = new Date()): boolean {
  return WEEKDAYS.indexOf(weekday) === weekdayIndex(now);
}

export interface RouteDeparture {
  entry: ScheduleEntry;
  /** Время начала пары "как время суток" — дата не важна, важны только часы:минуты. */
  arriveAt: Date;
  departAt: Date;
}

/**
 * Считает время выхода сразу для всех записей расписания (для всех дней недели),
 * а не только для ближайшей — результат отсортирован по дню недели (пн..вс), затем по времени.
 */
export function calculateAllDepartures(
  schedule: ScheduleEntry[],
  bufferMinutes: number,
  travelMinutes: number,
): RouteDeparture[] {
  return schedule
    .map((entry) => {
      const { hours, minutes } = parseTime(entry.time);
      const arriveAt = new Date(2000, 0, 3, hours, minutes, 0, 0); // 3 янв 2000 — понедельник, дата не используется
      const { departAt } = calculateDeparture({
        arriveAt,
        bufferMinutes,
        durationSeconds: travelMinutes * 60,
      });
      return { entry, arriveAt, departAt };
    })
    .sort((a, b) => {
      const dayDiff = WEEKDAYS.indexOf(a.entry.weekday) - WEEKDAYS.indexOf(b.entry.weekday);
      return dayDiff !== 0 ? dayDiff : a.arriveAt.getTime() - b.arriveAt.getTime();
    });
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
